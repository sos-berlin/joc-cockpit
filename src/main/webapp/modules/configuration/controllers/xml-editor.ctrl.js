"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(function () {
    'use strict';

    angular.module('app').controller('XMLEditorCtrl', XMLEditorCtrl);
    XMLEditorCtrl.$inject = ['$scope', '$location', '$http', '$uibModal', 'gettextCatalog', 'toasty', 'FileUploader', 'EditorService', 'clipboard', '$interval', 'CoreService'];

    function XMLEditorCtrl($scope, $location, $http, $uibModal, gettextCatalog, toasty, FileUploader, EditorService, clipboard, $interval, CoreService) {
        var vm = $scope;
        vm.sideView = CoreService.getSideView();
        vm.counting = 0;
        vm.autoAddCount = 0;
        vm.nodes = [];
        vm.childNode = [];
        vm.selectedXsd = {
            xsd: ''
        };
        vm.submitXsd = false;
        vm.isLoading = true;
        vm.fileLoading = false;
        vm.showSelectSchema = false;
        vm.recreateJsonFlag = false;
        vm.objectXml = {};
        $('body').addClass('xml-tooltip');
        vm.treeOptions = {
            beforeDrop: function beforeDrop(e) {
                var sourceValue = e.source.nodeScope.$modelValue,
                    destValue = e.dest.nodesScope.node ? e.dest.nodesScope.node : undefined;

                if (destValue && destValue.nodes && destValue.nodes.length > 0) {
                    vm.addOrderOnIndividualData(destValue);
                }

                return dragAndDropRules(sourceValue, destValue, e);
            },
            dragStop: function dragStop(e) {
                e.dest.nodesScope.node.nodes = _.orderBy(e.dest.nodesScope.node.nodes, ['order'], ['asc']);
            }
        };
        var uploader = $scope.uploader = new FileUploader({
            url: '',
            alias: 'file'
        }); // CALLBACKS

        uploader.onAfterAddingFile = function (item) {
            var fileExt = item.file.name.slice(item.file.name.lastIndexOf('.') + 1).toUpperCase();

            if (vm.importXSDFile) {
                if (fileExt != 'XSD') {
                    toasty.error({
                        title: gettextCatalog.getString('xml.message.invalidXSDFileExtension'),
                        timeout: 10000
                    });
                    item.remove();
                } else {
                    readFile(item);
                }
            } else {
                if (fileExt != 'XML') {
                    toasty.error({
                        title: gettextCatalog.getString('xml.message.invalidXMLFileExtension'),
                        timeout: 10000
                    });
                    item.remove();
                } else {
                    readFile(item);
                }
            }
        };

        function readFile(item) {
            vm.fileLoading = true;
            var reader = new FileReader();
            reader.readAsText(item._file, 'UTF-8');
            reader.onload = onLoadFile;
        }

        var interval = $interval(function () {
            if (vm.submitXsd && !vm.objectXml.xml) {
                storeXML();
            }
        }, 30000);

        function compare(str1, str2) {
            var a = str1.replace(/\s/g, '');
            var b = str2.replace(/\s/g, '');
            return angular.equals(a, b);
        }

        function storeXML(cb) {
            if (!vm.permission || !vm.permission.JobschedulerMaster || !vm.permission.JobschedulerMaster.administration.configurations.edit) {
                return;
            }

            vm._xml = _showXml();

            if (!vm._xml) {
                return;
            }

            var eRes;

            if (vm.prevXML && vm._xml) {
                eRes = compare(vm.prevXML.toString(), vm._xml.toString());
            }

            if (!eRes && vm.objectType !== 'OTHER') {
                EditorService.storeXML({
                    jobschedulerId: vm.schedulerIds.selected,
                    objectType: vm.objectType,
                    configuration: vm._xml,
                    configurationJson: JSON.stringify({
                        nodesCount: vm.counting,
                        node: vm.nodes
                    })
                }).then(function (res) {
                    vm.isDeploy = false;
                    vm.XSDState = Object.assign({}, {
                        message: res.message
                    });
                    vm.XSDState.modified = res.modified;
                    vm.prevXML = vm._xml;
                    hideButtons();
                }, function (error) {
                    toasty.error({
                        msg: error.data.error.message,
                        timeout: 20000
                    });
                });
            } else if (!eRes) {
                EditorService.storeXML({
                    jobschedulerId: vm.schedulerIds.selected,
                    objectType: vm.objectType,
                    configuration: vm._xml,
                    configurationJson: JSON.stringify({
                        nodesCount: vm.counting,
                        node: vm.nodes
                    }),
                    id: vm.activeTab.id,
                    name: vm.activeTab.name,
                    schemaIdentifier: vm.schemaIdentifier,
                    schema: vm.path
                }).then(function (res) {
                    vm.isDeploy = false;
                    vm.XSDState = Object.assign({}, {
                        message: res.message
                    });
                    vm.XSDState.modified = res.modified;
                    vm.prevXML = vm._xml;
                    vm.activeTab.id = res.id;
                    hideButtons();

                    if (cb) {
                        cb();
                    }
                }, function (error) {
                    toasty.error({
                        msg: error.data.error.message,
                        timeout: 20000
                    });
                });
            } else {
                if (cb) {
                    cb();
                }
            }
        }

        function onLoadFile(event) {
            vm.uploadData = event.target.result;

            if (vm.uploadData == undefined && vm.uploadData == '') {
                toasty.error({
                    title: !vm.importXSDFile ? gettextCatalog.getString('xml.message.invalidXMLFile') : gettextCatalog.getString('xml.message.invalidXSDFile'),
                    timeout: 10000
                });
            }
        }

        vm.collapseAll = function () {
            for (var i = 0; i < vm.nodes.length; i++) {
                if (vm.nodes[i].nodes && vm.nodes[i].nodes.length > 0) {
                    vm.nodes[i].expanded = false;
                    expandCollapseRec(vm.nodes[i].nodes, false);
                }
            }
        };

        function expandCollapseRec(node, flag) {
            for (var i = 0; i < node.length; i++) {
                if (node[i].nodes && node[i].nodes.length > 0) {
                    node[i].expanded = flag;
                    expandCollapseRec(node[i].nodes, flag);
                }
            }
        }

        vm.expandAll = function () {
            for (var i = 0; i < vm.nodes.length; i++) {
                if (vm.nodes[i].nodes && vm.nodes[i].nodes.length > 0) {
                    vm.nodes[i].expanded = true;
                    expandCollapseRec(vm.nodes[i].nodes, true);
                }
            }
        };

        vm.collapseAll1 = function () {
            for (var i = 0; i < vm._nodes.length; i++) {
                vm._nodes[i].expanded = false;

                if (vm._nodes[i].nodes && vm._nodes[i].nodes.length > 0) {
                    expandCollapseRec(vm._nodes[i].nodes, false);
                }
            }
        };

        vm.expandAll1 = function () {
            for (var i = 0; i < vm._nodes.length; i++) {
                vm._nodes[i].expanded = true;

                if (vm._nodes[i].nodes && vm.nodes[i].nodes.length > 0) {
                    expandCollapseRec(vm._nodes[i].nodes, true);
                }
            }
        };

        vm.collapseNode = function (node) {
            node.expanded = false;

            if (node.nodes && node.nodes.length > 0) {
                expandCollapseRec(node.nodes, false);
            }
        };

        vm.expandNode = function (node) {
            node.expanded = true;

            if (node.nodes && node.nodes.length > 0) {
                expandCollapseRec(node.nodes, true);
            }
        };

        function reassignSchema() {
            vm.reassignSchema = true;
            vm.submitXsd = false;
            vm.showSelectSchema = true;

            if (vm.uploader && vm.uploader.queue && vm.uploader.queue.length > 0) {
                vm.fileName = vm.uploader.queue[0]._file.name;
                vm.uploader.queue[0].remove();
            }

            vm.selectedXsd.xsd = vm.schemaIdentifier ? vm.schemaIdentifier : vm.selectedXsd.xsd;
            if (localStorage.getItem('schemas')) vm.otherSchema = localStorage.getItem('schemas').split(',');
        }

        vm.cancelReassignSchema = function () {
            vm.reassignSchema = false;
            vm.submitXsd = true;
            vm.showSelectSchema = false;
        };

        vm.changeSchema = function () {
            vm.isLoading = true;
            var obj;

            if (!vm.importXSDFile) {
                obj = {
                    jobschedulerId: vm.schedulerIds.selected,
                    objectType: "OTHER",
                    uri: vm.selectedXsd.xsd,
                    configuration: _showXml()
                };
            } else {
                obj = {
                    jobschedulerId: vm.schedulerIds.selected,
                    objectType: "OTHER",
                    fileName: vm.uploader.queue[0]._file.name,
                    fileContent: vm.uploadData,
                    configuration: _showXml()
                };
            }

            EditorService.reassignSchema(obj).then(function (res) {
                vm.doc = new DOMParser().parseFromString(res.schema, 'application/xml');
                vm.nodes = [];
                vm.nodes.push(JSON.parse(res.configurationJson));
                vm.getIndividualData(vm.nodes[0]);
                vm.getData(vm.nodes[0]);
                vm.submitXsd = true;
                vm.isDeploy = false;
                vm.activeTab.schemaIdentifier = res.schemaIdentifier;
                vm.showSelectSchema = false;
                vm.prevXML = '';
                vm.schemaIdentifier = res.schemaIdentifier;
                storeXML(res.schemaIdentifier);
                vm.path = res.schemaIdentifier;
                vm.selectedXsd.xsd = res.schemaIdentifier;
                vm.isLoading = false;
                vm.reassignSchema = false;
            }, function () {
                vm.isLoading = false;
            });
        };

        function removeComment(data) {
            var d = data.replace(/\<\!\-\-((?!\-\-\>)[\s\S])*\-\-\>\s*/g, '');
            return d.replace(/(\\n)/g, '');
        }

        function ngOnInit() {
            EditorService.readXML({
                jobschedulerId: vm.schedulerIds.selected,
                objectType: vm.objectType
            }).then(function (res) {
                vm.schemaIdentifier = res.schemaIdentifier;
                vm.path = res.schema;
                vm.XSDState = res.state;
                vm.submitXsd = true;
                vm.isDeploy = res.state.deployed;
                vm.XSDState.modified = res.modified;
                vm.doc = new DOMParser().parseFromString(vm.path, 'application/xml');

                if (res.configurationJson) {
                    var _tempArrToExpand = [];
                    vm.prevXML = removeComment(res.configuration);
                    var jsonArray;

                    try {
                        jsonArray = JSON.parse(res.configurationJson);
                    } catch (e) {
                        vm.isLoading = false;
                        vm.submitXsd = false;
                    }

                    vm.recreateJsonFlag = res.recreateJson;

                    if (!res.recreateJson) {
                        vm.nodes = [];
                        handleNodeToExpandAtOnce(jsonArray.node, null, _tempArrToExpand);
                        vm.nodes = jsonArray.node;
                        vm.counting = angular.copy(jsonArray.nodesCount);
                    } else {
                        var a = [jsonArray];
                        vm.counting = jsonArray.lastUuid;
                        vm.nodes = a;
                        vm.getIndividualData(vm.nodes[0]);
                        vm.selectedNode = vm.nodes[0];
                    }

                    vm.isLoading = false;
                    vm.selectedNode = vm.nodes[0];
                    vm.selectedNode.expanded = true;
                    hideButtons();

                    if (_tempArrToExpand && _tempArrToExpand.length > 0) {
                        setTimeout(function () {
                            for (var i = 0; i < _tempArrToExpand.length; i++) {
                                _tempArrToExpand[i].expanded = true;
                            }
                        }, 10);
                    }
                } else if (res.configuration) {
                    if (!ok(res.configuration)) {
                        vm.nodes = [];
                        vm.isLoading = true;
                        vm.XSDState = res.state;
                        vm.submitXsd = true;
                        vm.isDeploy = res.state.deployed;
                        vm.XSDState.modified = res.modified;
                        vm.prevXML = removeComment(res.configuration);
                        loadTree(vm.path, true);
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
                    vm.XSDState = Object.assign(vm.XSDState, {
                        warning: res.warning
                    });
                    hideButtons();
                }
            }, function (err) {
                vm.submitXsd = false;
                vm.isLoading = false;
                vm.XSDState = '';
                vm.error = true;
                toasty.error({
                    msg: err.data.error.message,
                    timeout: 20000
                });
                hideButtons();
            });
        }

        function handleNodeToExpandAtOnce(nodes, path, _tempArrToExpand) {
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].expanded) {
                    if (!path) {
                        nodes[i].path = nodes[i].parent + '/' + nodes[i].ref;
                    } else {
                        nodes[i].path = path + '/' + nodes[i].ref;
                    }

                    if (nodes[i].nodes && nodes[i].nodes.length) {
                        if (nodes[i].path.split('/').length === 10) {
                            _tempArrToExpand.push(nodes[i]);

                            nodes[i].expanded = false;
                        }

                        handleNodeToExpandAtOnce(nodes[i].nodes, nodes[i].path, _tempArrToExpand);
                    }
                }
            }
        }

        vm.addOrderOnIndividualData = function (node) {
            if (!node.recreateJson) {
                var a = vm.checkChildNode(node);

                if (a && a.length > 0 && node && node.nodes && node.nodes.length > 0) {
                    for (var j = 0; j < node.nodes.length; j++) {
                        for (var i = 0; i < a.length; i++) {
                            if (a[i].ref === node.nodes[j].ref) {
                                node.nodes[j].order = i;
                                break;
                            }
                        }
                    }
                }

                getNodeRulesData(node);
            }
        };

        function getNodeRulesData(node) {
            if (!node.recreateJson) {
                var nod = {
                    ref: node.parent
                };
                var a = vm.checkChildNode(nod);

                if (a && a.length > 0) {
                    for (var i = 0; i < a.length; i++) {
                        if (a[i].ref === node.ref) {
                            node = Object.assign(node, a[i]);
                        }
                    }
                }

                a = vm.checkChildNode(node);

                if (a && a.length > 0) {
                    for (var _i = 0; _i < a.length; _i++) {
                        for (var j = 0; j < node.nodes.length; j++) {
                            if (a[_i].ref == node.nodes[j].ref) {
                                node.nodes[j] = Object.assign(node.nodes[j], a[_i]);
                            }
                        }
                    }
                }
            }
        }

        vm.getIndividualData = function (node, scroll) {
            var attrs = checkAttributes(node.ref);

            if (attrs && attrs.length > 0) {
                if (node.attributes && node.attributes.length > 0) {
                    for (var i = 0; i < attrs.length; i++) {
                        for (var j = 0; j < node.attributes.length; j++) {
                            checkAttrsValue(attrs[i]);
                            checkAttrsText(attrs[i]);

                            if (attrs[i].name == node.attributes[j].name) {
                                attrs[i] = Object.assign(attrs[i], node.attributes[j]);
                            }
                        }
                    }
                }
            }

            var value = getValues(node.ref);

            if (node.values && node.values.length > 0) {
                for (var _i2 = 0; _i2 < value.length; _i2++) {
                    for (var _j = 0; _j < node.values.length; _j++) {
                        if (value[_i2].parent === node.values[_j].parent) {
                            value[_i2] = Object.assign(value[_i2], node.values[_j]);
                        }
                    }
                }
            }

            var attrsType = getAttrFromType(node.ref, node.parent);

            if (attrsType && attrsType.length > 0) {
                if (node.attributes && node.attributes.length > 0) {
                    for (var _i3 = 0; _i3 < attrsType.length; _i3++) {
                        for (var _j2 = 0; _j2 < node.attributes.length; _j2++) {
                            if (attrsType[_i3].name == node.attributes[_j2].name) {
                                attrsType[_i3] = Object.assign(attrsType[_i3], node.attributes[_j2]);
                            }
                        }
                    }
                }
            }

            var valueType = getValueFromType(node.ref, node.parent);

            if (valueType) {
                if (node.values && node.values.length > 0) {
                    for (var _i4 = 0; _i4 < valueType.length; _i4++) {
                        for (var _j3 = 0; _j3 < node.values.length; _j3++) {
                            if (valueType[_i4].parent === node.values[_j3].parent) {
                                valueType[_i4] = Object.assign(valueType[_i4], node.values[_j3]);
                            }
                        }
                    }
                }
            }

            var val = getVal(node);

            if (val) {
                if (node.values && node.values.length > 0) {
                    for (var _i5 = 0; _i5 < val.length; _i5++) {
                        for (var _j4 = 0; _j4 < node.values.length; _j4++) {
                            if (val[_i5].parent === node.values[_j4].parent) {
                                val[_i5] = Object.assign(val[_i5], node.values[_j4]);
                            }
                        }
                    }
                }
            }

            if (_.isEmpty(val) && _.isEmpty(value) && _.isEmpty(valueType)) {
                val = getValFromDefault(node);

                if (node.values && node.values.length > 0) {
                    for (var _i6 = 0; _i6 < val.length; _i6++) {
                        for (var _j5 = 0; _j5 < node.values.length; _j5++) {
                            if (val[_i6].parent === node.values[_j5].parent) {
                                val[_i6] = Object.assign(val[_i6], node.values[_j5]);
                            }
                        }
                    }
                }
            }

            if (!_.isEmpty(attrs)) {
                attachAttrs(attrs, node);
            }

            if (!_.isEmpty(val)) {
                node.values = angular.copy([]);

                for (var _j6 = 0; _j6 < val.length; _j6++) {
                    val[_j6].uuid = vm.counting;
                    vm.counting++;

                    if (val[_j6].base === 'password') {
                        val[_j6].pShow = false;
                    }

                    if (node && node.values) {
                        node.values = angular.copy([]);
                        node.values.push(val[_j6]);
                    }
                }
            }

            if (!_.isEmpty(value)) {
                node.values = [];

                for (var _j7 = 0; _j7 < value.length; _j7++) {
                    value[_j7].uuid = vm.counting;
                    vm.counting++;

                    if (value[_j7].base === 'password') {
                        value[_j7].pShow = false;
                    }

                    if (node && node.values) {
                        node.values = angular.copy([]);
                        node.values.push(value[_j7]);
                    }
                }
            }

            if (valueType !== undefined) {
                for (var _j8 = 0; _j8 < valueType.length; _j8++) {
                    valueType[_j8].uuid = vm.counting;
                    vm.counting++;

                    if (valueType[_j8].base === 'password') {
                        valueType[_j8].pShow = false;
                    }

                    if (node && node.values) {
                        node.values = angular.copy([]);
                        node.values.push(valueType[_j8]);
                    }
                }
            }

            if (attrsType !== undefined) {
                for (var _j9 = 0; _j9 < attrsType.length; _j9++) {
                    for (var _i7 = 0; _i7 < node.attributes.length; _i7++) {
                        if (attrsType[_j9].name !== node.attributes[_i7].name) {
                            attrsType[_j9].uuid = vm.counting;
                            vm.counting++;

                            if (attrsType[_j9].name === 'password') {
                                attrsType[_j9].pShow = false;
                            }

                            node.attributes.push(attrsType[_j9]);
                        } else {
                            node.attributes[_i7] = Object.assign(node.attributes[_i7], attrsType[_j9]);
                        }
                    }
                }
            }

            if (!node.recreateJson) {
                printArraya(false);
                node.recreateJson = true;
            }

            if (scroll) {
                vm.scrollTreeToGivenId(vm.selectedNode.uuid);
            }
        };

        function hideButtons() {
            toasty.clear();
            vm.$emit('hide-button', {
                submitXSD: vm.submitXsd,
                isDeploy: vm.isDeploy,
                XSDState: vm.XSDState,
                type: vm.objectType
            });
        }

        vm.checkOrder = function (node) {
            setTimeout(function () {
                if (node && vm.childNode.length > 0) {
                    if (vm.childNode && vm.childNode.length > 0 && node && node.nodes && node.nodes.length > 0) {
                        for (var j = 0; j < node.nodes.length; j++) {
                            for (var i = 0; i < vm.childNode.length; i++) {
                                if (vm.childNode[i].ref === node.nodes[j].ref) {
                                    node.nodes[j].order = i;
                                    break;
                                }
                            }
                        }
                    }
                }

                getNodeRulesData(node);
            }, 10);
        };

        submit();

        function loadTree(xml, check) {
            vm.doc = new DOMParser().parseFromString(xml, 'application/xml');
            getRootNode(vm.doc, check);
            xpathFunc();
            addKeyReferencing();
            vm.selectedNode = vm.nodes[0];
            vm.selectedNode.expanded = true;
            vm.getData(vm.nodes[0]);
            vm.isLoading = !!check;
        } // submit xsd to open


        function submit() {
            vm.ckEditor = null;
            var path = $location.path();
            var x = path.split('/')[2];
            vm.objectType = x.toUpperCase();

            if (x == 'notification') {
                vm.selectedXsd.xsd = 'systemMonitorNotification';
            } else if (x === 'yade') {
                vm.selectedXsd.xsd = x;
            }

            if (vm.selectedXsd.xsd !== '' && vm.objectType !== 'OTHER') {
                vm.selectedDd = x;
                ngOnInit();
            } else {
                vm.submitXsd = false;
                EditorService.readXML({
                    jobschedulerId: vm.schedulerIds.selected,
                    objectType: vm.objectType
                }).then(function (res) {
                    if (res.schemas) {
                        vm.otherSchema = res.schemas;
                        localStorage.setItem('schemas', vm.otherSchema);
                    }

                    if (!res.configurations) {
                        vm.tabsArray = [];
                        vm.isLoading = false;
                    } else {
                        vm.tabsArray = angular.copy(res.configurations);
                        vm.activeTab = vm.tabsArray[length - 1];
                        readOthersXSD(vm.activeTab.id);
                    }
                }, function (error) {
                    vm.isLoading = false;
                    vm.tabsArray = [];
                    vm.error = true;

                    if (error.data && error.data.error) {
                        toasty.error({
                            msg: error.data.error.message,
                            timeout: 20000
                        });
                    }
                });
                hideButtons();
            }
        }

        vm.othersSubmit = function () {
            vm.isLoading = true;
            var obj = {
                jobschedulerId: vm.schedulerIds.selected,
                objectType: "OTHER"
            };

            if (!vm.importXSDFile) {
                obj.uri = vm.selectedXsd.xsd;
            } else {
                obj.fileName = vm.uploader.queue[0]._file.name;
                obj.fileContent = vm.uploadData;
            }

            vm.path = vm.selectedXsd.xsd;
            EditorService.assignSchema(obj).then(function (res) {
                vm.schemaIdentifier = res.schemaIdentifier;
                loadTree(res.schema, false);
                vm.submitXsd = true;
                vm.isDeploy = false;
                vm.prevXML = '';
                vm.isLoading = false;
                storeXML(res.schemaIdentifier);
                vm._activeTab.isVisible = false;
            }, function (error) {
                vm.isLoading = false;

                if (error.data && error.data.error) {
                    toasty.error({
                        msg: error.data.error.message,
                        timeout: 20000
                    });
                }
            });
        };

        vm.changeXSD = function (data) {
            vm.selectedXsd.xsd = data;
        }; // create json from xml


        function createJSONFromXML(data) {
            var result1;

            try {
                result1 = xml2json(data, {
                    compact: true,
                    spaces: 4,
                    ignoreDeclaration: true,
                    ignoreComment: true,
                    alwaysChildren: true
                });
                var rootNode;
                var r_node;
                var x;

                try {
                    x = JSON.parse(result1);
                } catch (e) {
                    vm.submitXsd = false;
                    vm.isLoading = false;
                    vm.error = true;
                    hideButtons();
                }

                for (var key in x) {
                    rootNode = key;
                }

                var json = createTempJson(x, rootNode);

                for (var _key in json) {
                    r_node = _key;
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
                vm.error = true;
                hideButtons();
            }
        }

        function createTempJson(editJson, rootNode) {
            var temp = {};

            if (_.isArray(editJson[rootNode])) {
                for (var i = 0; i < editJson[rootNode].length; i++) {
                    temp = Object.assign(temp, _defineProperty({}, rootNode, editJson[rootNode][i]));
                }
            } else {
                for (var a in editJson[rootNode]) {
                    if (a == '_text') {
                        editJson[rootNode]['_cdata'] = editJson[rootNode]['_text'];
                        delete editJson[rootNode]['_text'];
                        a = '_cdata';
                    }

                    if (a == '_attributes' || a == '_cdata') {
                        if (temp[rootNode] == undefined) {
                            temp = Object.assign(temp, _defineProperty({}, rootNode, _defineProperty({}, a, editJson[rootNode][a])));
                        } else {
                            temp[rootNode] = Object.assign(temp[rootNode], _defineProperty({}, a, editJson[rootNode][a]));
                        }
                    } else {
                        if (_.isArray(editJson[rootNode][a])) {
                            for (var _i8 = 0; _i8 < editJson[rootNode][a].length; _i8++) {
                                var x = a + '*' + _i8;

                                if (temp[rootNode] == undefined) {
                                    temp = Object.assign(temp, _defineProperty({}, rootNode, _defineProperty({}, x, {})));
                                } else {
                                    temp[rootNode] = Object.assign(temp[rootNode], _defineProperty({}, x, {}));
                                }

                                for (var key in editJson[rootNode][a][_i8]) {
                                    createTempJsonRecursion(key, temp[rootNode][x], editJson[rootNode][a][_i8]);
                                }
                            }
                        } else {
                            if (temp[rootNode] == undefined) {
                                temp = Object.assign(temp, _defineProperty({}, rootNode, _defineProperty({}, a, {})));

                                for (var _key2 in editJson[rootNode][a]) {
                                    createTempJsonRecursion(_key2, temp[rootNode][a], editJson[rootNode][a]);
                                }
                            } else {
                                temp[rootNode] = Object.assign(temp[rootNode], _defineProperty({}, a, {}));

                                for (var _key3 in editJson[rootNode][a]) {
                                    createTempJsonRecursion(_key3, temp[rootNode][a], editJson[rootNode][a]);
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
                editJson['_cdata'] = editJson['_text'];
                delete editJson['_text'];
                key = '_cdata';
            }

            if (key == '_attributes' || key == '_cdata') {
                tempArr = Object.assign(tempArr, _defineProperty({}, key, editJson[key]));
            } else {
                if (editJson && _.isArray(editJson[key])) {
                    for (var i = 0; i < editJson[key].length; i++) {
                        var x = key + '*' + i;
                        tempArr = Object.assign(tempArr, _defineProperty({}, x, {}));

                        if (editJson) {
                            for (var as in editJson[key][i]) {
                                createTempJsonRecursion(as, tempArr[x], editJson[key][i]);
                            }
                        }
                    }
                } else {
                    tempArr = Object.assign(tempArr, _defineProperty({}, key, {}));

                    if (editJson) {
                        for (var _x in editJson[key]) {
                            createTempJsonRecursion(_x, tempArr[key], editJson[key]);
                        }
                    }
                }
            }
        }

        function createJsonAccToXsd(xmljson, rootNode, mainjson) {
            mainjson.nodes = [];

            if (xmljson[rootNode] && xmljson[rootNode]._attributes !== undefined) {
                for (var key in xmljson[rootNode]._attributes) {
                    if (mainjson && mainjson.attributes) {
                        for (var i = 0; i < mainjson.attributes.length; i++) {
                            if (key === mainjson.attributes[i].name) {
                                var a = xmljson[rootNode]._attributes[key];
                                mainjson.attributes[i] = Object.assign(mainjson.attributes[i], {
                                    data: a
                                });
                            }
                        }
                    }
                }
            }

            if (xmljson[rootNode] && xmljson[rootNode]._cdata !== undefined) {
                mainjson.values[0] = Object.assign(mainjson.values[0], {
                    data: xmljson[rootNode]._cdata
                });
            }

            for (var _key4 in xmljson[rootNode]) {
                if (_key4 !== '_attributes' && _key4 !== '_cdata') {
                    addChildForXml(_key4, rootNode, xmljson, mainjson);
                }
            }
        }

        function addChildForXml(key, rootNode, xmljson, mainjson) {
            var a;

            if (key.indexOf('*')) {
                a = key.split('*')[0];
            }

            vm.checkChildNode(mainjson);

            for (var i = 0; i < vm.childNode.length; i++) {
                if (a === vm.childNode[i].ref) {
                    vm.childNode[i].import = key;
                    vm.addChild(vm.childNode[i], mainjson, false, i);
                }
            }

            for (var _i9 = 0; _i9 < mainjson.nodes.length; _i9++) {
                if (mainjson.nodes[_i9].ref == a && mainjson.nodes[_i9].import == key) {
                    createJsonAccToXsd(xmljson[rootNode], key, mainjson.nodes[_i9]);
                }
            }
        } // create json if xsd not matched


        function createNormalTreeJson(xmljson, rootNode, mainjson, parent) {
            var temp = {};
            vm.getData(temp);
            var a = undefined;

            if (rootNode.indexOf('*')) {
                a = rootNode.split('*')[0];
            }

            if (a == undefined) {
                mainjson = Object.assign(mainjson, {
                    ref: rootNode,
                    parent: parent
                });
            } else {
                mainjson = Object.assign(mainjson, {
                    ref: a,
                    parent: parent,
                    import: rootNode
                });
            }

            for (var key in xmljson[rootNode]) {
                if (key === '_attributes') {
                    mainjson = Object.assign(mainjson, {
                        attributes: []
                    });

                    for (var x in xmljson[rootNode]._attributes) {
                        var dat = xmljson[rootNode]._attributes[x];
                        var temp1 = {};
                        temp1 = Object.assign(temp1, {
                            name: x,
                            data: dat,
                            parent: rootNode
                        });
                        mainjson.attributes.push(temp1);
                    }
                }
            }

            for (var _key5 in xmljson[rootNode]) {
                if (_key5 !== '_attributes' && _key5 !== '_cdata') {
                    if (!mainjson.nodes) {
                        mainjson = Object.assign(mainjson, {
                            nodes: []
                        });
                    }

                    addChildToNormal(_key5, rootNode, xmljson, mainjson);
                }
            }
        }

        function addChildToNormal(key, rootNode, xmljson, mainjson) {
            var temp = {};
            var a = undefined;

            if (key.indexOf('*')) {
                a = key.split('*')[0];
            }

            if (a == undefined) {
                temp = Object.assign(temp, {
                    ref: key,
                    parent: rootNode,
                    import: key
                });
            } else {
                temp = Object.assign(temp, {
                    ref: a,
                    parent: rootNode,
                    import: key
                });
            }

            mainjson.nodes.push(temp);

            for (var i = 0; i < mainjson.nodes.length; i++) {
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
            if (typeof data.data === 'string' && data && data.data && data.data.match(/<[^>]+>/gm)) {
                var x = data.data.replace(/<[^>]+>/gm, '');
                x = x.replace('&nbsp;', ' ');
                return x;
            } else {
                return data.data;
            }
        };

        function addKeyReferencing() {
            var key = {};

            if (vm.nodes[0] && vm.nodes[0].keyref) {
                for (var i = 0; i < vm.nodes[0].attributes.length; i++) {
                    if (vm.nodes[0].attributes[i].refer) {
                        key = Object.assign(key, {
                            refe: vm.nodes[0].ref,
                            name: vm.nodes[0].attributes[i].refer
                        });
                        attachKeyReferencing(key);
                        break;
                    }
                }
            } else {
                if (vm.nodes[0] && vm.nodes[0].nodes) {
                    for (var _i10 = 0; _i10 < vm.nodes[0].nodes.length; _i10++) {
                        addKeyReferencingRecursion(vm.nodes[0].nodes[_i10]);
                    }
                }
            }
        }

        function addKeyReferencingRecursion(child) {
            var key = {};

            if (child.keyref && child.attributes) {
                for (var i = 0; i < child.attributes.length; i++) {
                    if (child.attributes[i].refer) {
                        key = Object.assign(key, {
                            refe: child.ref,
                            name: child.attributes[i].refer
                        });
                        attachKeyReferencing(key);

                        if (child.nodes) {
                            for (var _i11 = 0; _i11 < child.nodes.length; _i11++) {
                                addKeyReferencingRecursion(child.nodes[_i11]);
                            }
                        }

                        break;
                    }
                }
            } else {
                if (child && child.nodes) {
                    for (var _i12 = 0; _i12 < child.nodes.length; _i12++) {
                        addKeyReferencingRecursion(child.nodes[_i12]);
                    }
                }
            }
        }

        function attachKeyReferencing(key) {
            if (key.name) {
                if (vm.nodes[0].ref === key.name && vm.nodes[0].key) {
                    for (var i = 0; i < vm.nodes[0].attributes.length; i++) {
                        if (vm.nodes[0].attributes[i].name === vm.nodes[0].key) {
                            vm.nodes[0].attributes[i].refElement = key.refe;
                            break;
                        }
                    }
                } else {
                    for (var _i13 = 0; _i13 < vm.nodes[0].nodes.length; _i13++) {
                        attachKeyReferencingRecursion(key, vm.nodes[0].nodes[_i13]);
                    }
                }
            }
        }

        function attachKeyReferencingRecursion(key, child) {
            if (key.name) {
                if (child.ref === key.name && child.key && child.attributes) {
                    for (var i = 0; i < child.attributes.length; i++) {
                        if (child.attributes[i].name === child.key) {
                            child.attributes[i].refElement = key.refe;
                            break;
                        }
                    }
                } else {
                    for (var _i14 = 0; _i14 < child.nodes.length; _i14++) {
                        attachKeyReferencingRecursion(key, child.nodes[_i14]);
                    }
                }
            }
        }

        function getRootNode(doc, check) {
            var temp, attrs, child;
            var select = xpath.useNamespaces({
                'xs': 'http://www.w3.org/2001/XMLSchema'
            });
            var rootElementPath = '//xs:element';
            var root = select(rootElementPath, doc);

            if (!root || !root[0]) {
                return;
            }

            for (var i = 0; i < root[0].attributes.length; i++) {
                var b = root[0].attributes[i].nodeValue;
                temp = Object.assign({}, {
                    ref: b
                });
            }

            temp.parent = '#';
            temp.uuid = vm.counting;
            vm.counting++;
            attrs = checkAttributes(temp.ref);

            if (attrs.length > 0) {
                temp.attributes = [];

                for (var _i15 = 0; _i15 < attrs.length; _i15++) {
                    checkAttrsText(attrs[_i15]);
                    attrs[_i15].id = vm.counting;
                    vm.counting++;
                    temp.attributes.push(attrs[_i15]);
                }
            }

            setTimeout(function () {
                temp.show = !temp.attributes;
            }, 0);
            var text = checkText(temp.ref);

            if (text) {
                temp.text = text;
            }

            if (!check) {
                child = vm.checkChildNode(temp);

                if (child.length > 0) {
                    for (var _i16 = 0; _i16 < child.length; _i16++) {
                        if (child[_i16].minOccurs == undefined) {
                            if (!temp.nodes) {
                                temp.nodes = [];
                            }

                            vm.addChild(child[_i16], temp, true, _i16);
                        }
                    }
                }
            }

            printArray(temp);
        }

        function checkText(node) {
            var select = xpath.useNamespaces({
                'xs': 'http://www.w3.org/2001/XMLSchema'
            });
            var documentationPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:annotation/xs:documentation/@*';
            var element = select(documentationPath, vm.doc);
            var text = {};

            if (element.length > 0) {
                for (var i = 0; i < element.length; i++) {
                    var a = element[i].nodeName;
                    var b = element[i].nodeValue[0].innerHTML;
                    text = Object.assign(text, _defineProperty({}, a, b));
                }
            } else {
                var documentationPath1 = '/xs:schema/xs:element[@ref=\'' + node + '\']/xs:annotation/xs:documentation/@*';
                var element1 = select(documentationPath1, vm.doc);

                for (var _i17 = 0; _i17 < element1.length; _i17++) {
                    var _a = element1[_i17].nodeName;
                    var _b = element1[_i17].nodeValue[0].innerHTML;
                    text = Object.assign(text, _defineProperty({}, _a, _b));
                }
            }

            var documentationPath2 = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:annotation/xs:documentation';
            var element2 = select(documentationPath2, vm.doc);

            if (element2.length > 0) {
                text.doc = element2[0].innerHTML;
            }

            text.parent = node;
            return text;
        }

        function checkAttrsText(node) {
            var select = xpath.useNamespaces({
                'xs': 'http://www.w3.org/2001/XMLSchema'
            });
            var textAttrsPath = '/xs:schema/xs:element[@name=\'' + node.parent + '\']/xs:complexType/xs:attribute[@name=\'' + node.name + '\']/xs:annotation/xs:documentation';
            var element = select(textAttrsPath, vm.doc);
            var text = {};

            if (element.length > 0) {
                text.doc = element;
                node.text = text;
            }

            if (element.length === 0) {
                var _textAttrsPath = '/xs:schema/xs:element[@name=\'' + node.parent + '\']/xs:complexType/xs:simpleContent/xs:extension/xs:attribute[@name=\'' + node.name + '\']/xs:annotation/xs:documentation';

                text.doc = select(_textAttrsPath, vm.doc);
                node.text = text;

                if (text.length === 0) {
                    var textAttrsPath1 = '/xs:schema/xs:element[@name=\'' + node.parent + '\']/xs:complexType/xs:complexContent/xs:extension/xs:attribute[@name=\'' + node.name + '\']/xs:annotation/xs:documentation';
                    text.doc = select(textAttrsPath1, vm.doc);

                    if (text.doc) {
                        node.text = text;
                    }
                }
            }
        }

        function _checkAttributes(attrsPath, attribute, node, attrsArr, select) {
            var attrs = select(attrsPath, vm.doc);

            if (attrs.length > 0) {
                for (var i = 0; i < attrs.length; i++) {
                    attribute = {};
                    var x = void 0;

                    for (var j = 0; j < attrs[i].attributes.length; j++) {
                        var a = attrs[i].attributes[j].nodeName;
                        var b = attrs[i].attributes[j].nodeValue;
                        attribute = Object.assign(attribute, _defineProperty({}, a, b));
                        var valueFromXmlEditorPath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:attribute[@name=\'' + b + '\']/xs:annotation/xs:appinfo/XmlEditor';
                        var attr1 = select(valueFromXmlEditorPath, vm.doc);

                        if (attr1.length > 0) {
                            if (attr1[0].attributes && attr1[0].attributes.length > 0) {
                                for (var _i18 = 0; _i18 < attr1[0].attributes.length; _i18++) {
                                    if (attr1[0].attributes[_i18].nodeName === 'type') {
                                        x = attr1[0].attributes[_i18].nodeValue;
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
            var select = xpath.useNamespaces({
                'xs': 'http://www.w3.org/2001/XMLSchema'
            });
            var complexTypePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType';
            var attribute = {};
            var attrsArr = [];
            var element = select(complexTypePath, vm.doc);

            if (element && element.length > 0) {
                _checkAttributes('/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:attribute', attribute, node, attrsArr, select);

                _checkAttributes('/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:complexContent/xs:extension/xs:attribute', attribute, node, attrsArr, select);

                _checkAttributes('/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:simpleContent/xs:extension/xs:attribute', attribute, node, attrsArr, select);
            }

            return attrsArr;
        }

        vm.checkChildNode = function (_nodes, data) {
            var node = _nodes.ref;
            var parentNode;

            if (!data) {
                vm.childNode = [];
            }

            var select = xpath.useNamespaces({
                'xs': 'http://www.w3.org/2001/XMLSchema'
            });
            var complexTypePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType';
            var TypePath = '/xs:schema/xs:element[@name=\'' + node + '\']';
            var nodes = {};
            var childArr = [];
            var element = select(complexTypePath, vm.doc);

            if (element.length > 0) {
                var sequencePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence';
                var choicePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:choice';
                var childFromBasePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:complexContent/xs:extension/@base';
                var complexContentWithElementPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:complexContent/xs:extension/xs:sequence/xs:element';
                var childs = select(childFromBasePath, vm.doc);
                var element1 = select(sequencePath, vm.doc);

                if (element1.length > 0) {
                    var cPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:element';
                    var cElement = select(cPath, vm.doc);
                    var dPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:choice/xs:element';
                    var dElement = select(dPath, vm.doc);

                    if (dElement.length > 0) {
                        for (var i = 0; i < dElement.length; i++) {
                            nodes = {};

                            for (var j = 0; j < dElement[i].attributes.length; j++) {
                                var a = dElement[i].attributes[j].nodeName;
                                var b = dElement[i].attributes[j].nodeValue;
                                nodes = Object.assign(nodes, _defineProperty({}, a, b));
                            }

                            nodes.parent = node;
                            nodes.choice = node;
                            childArr.push(nodes);

                            if (data) {
                                data.nodes = childArr;
                            } else {
                                vm.childNode = childArr;
                            }
                        }
                    }

                    if (cElement.length > 0) {
                        for (var _i19 = 0; _i19 < cElement.length; _i19++) {
                            nodes = {};

                            for (var _j10 = 0; _j10 < cElement[_i19].attributes.length; _j10++) {
                                var _a2 = cElement[_i19].attributes[_j10].nodeName;
                                var _b2 = cElement[_i19].attributes[_j10].nodeValue;
                                nodes = Object.assign(nodes, _defineProperty({}, _a2, _b2));
                            }

                            nodes.parent = node;
                            childArr.push(nodes);

                            if (data) {
                                data.nodes = childArr;
                            } else {
                                vm.childNode = childArr;
                            }
                        }
                    }

                    var ePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:choice/xs:sequence/xs:element';
                    var eElement = select(ePath, vm.doc);

                    if (eElement.length > 0) {
                        for (var _i20 = 0; _i20 < eElement.length; _i20++) {
                            nodes = {};

                            for (var _j11 = 0; _j11 < eElement[_i20].attributes.length; _j11++) {
                                var _a3 = eElement[_i20].attributes[_j11].nodeName;
                                var _b3 = eElement[_i20].attributes[_j11].nodeValue;
                                nodes = Object.assign(nodes, _defineProperty({}, _a3, _b3));
                            }

                            nodes.parent = node;

                            if (nodes.ref !== 'Minimum' && nodes.ref !== 'Maximum') {
                                nodes.choice = node;
                            }

                            if (nodes.minOccurs && !nodes.maxOccurs) {} else {
                                childArr.push(nodes);
                            }

                            if (data) {
                                data.nodes = childArr;
                            } else {
                                vm.childNode = childArr;
                            }
                        }
                    }

                    return childArr;
                }

                if (select(choicePath, vm.doc).length > 0) {
                    var childPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:choice/xs:element';
                    var childs1 = select(childPath, vm.doc);

                    if (childs1.length > 0) {
                        for (var _i21 = 0; _i21 < childs1.length; _i21++) {
                            nodes = {};

                            for (var _j12 = 0; _j12 < childs1[_i21].attributes.length; _j12++) {
                                var _a4 = childs1[_i21].attributes[_j12].nodeName;
                                var _b4 = childs1[_i21].attributes[_j12].nodeValue;
                                nodes = Object.assign(nodes, _defineProperty({}, _a4, _b4));
                            }

                            nodes.parent = node;
                            nodes.choice = node;
                            childArr.push(nodes);

                            if (data) {
                                data.nodes = childArr;
                            } else {
                                vm.childNode = childArr;
                            }
                        }

                        var childPath2 = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:choice/xs:sequence/xs:element';
                        var child12 = select(childPath2, vm.doc);

                        if (child12.length > 0) {
                            for (var _i22 = 0; _i22 < child12.length; _i22++) {
                                nodes = {};

                                for (var _j13 = 0; _j13 < child12[_i22].attributes.length; _j13++) {
                                    var _a5 = child12[_i22].attributes[_j13].nodeName;
                                    var _b5 = child12[_i22].attributes[_j13].nodeValue;
                                    nodes = Object.assign(nodes, _defineProperty({}, _a5, _b5));
                                }

                                nodes.parent = node;
                                nodes.choice = node;
                                childArr.push(nodes);

                                if (data) {
                                    data.nodes = childArr;
                                } else {
                                    vm.childNode = childArr;
                                }
                            }
                        }

                        return childArr;
                    }
                }

                if (childs.length > 0) {
                    if (childs[0].nodeValue !== 'NotEmptyType') {
                        var childrenPath = '/xs:schema/xs:complexType[@name=\'' + childs[0].nodeValue + '\']/xs:sequence/xs:element';
                        var sElement = select(childrenPath, vm.doc);

                        if (sElement.length > 0) {
                            for (var _i23 = 0; _i23 < sElement.length; _i23++) {
                                nodes = {};

                                for (var _j14 = 0; _j14 < sElement[_i23].attributes.length; _j14++) {
                                    var _a6 = sElement[_i23].attributes[_j14].nodeName;
                                    var _b6 = sElement[_i23].attributes[_j14].nodeValue;
                                    nodes = Object.assign(nodes, _defineProperty({}, _a6, _b6));
                                }

                                nodes.parent = node;
                                childArr.push(nodes);

                                if (data) {
                                    data.nodes = childArr;
                                } else {
                                    vm.childNode = childArr;
                                }
                            }
                        } else if (select(complexContentWithElementPath, vm.doc).length > 0) {
                            var childrenPath1 = '/xs:schema/xs:complexType[@name=\'' + childs[0].nodeValue + '\']/xs:choice/xs:element';
                            var elementx = select(childrenPath1, vm.doc);

                            if (elementx.length > 0) {
                                for (var _i24 = 0; _i24 < elementx.length; _i24++) {
                                    nodes = {};

                                    for (var _j15 = 0; _j15 < elementx[_i24].attributes.length; _j15++) {
                                        var _a7 = elementx[_i24].attributes[_j15].nodeName;
                                        var _b7 = elementx[_i24].attributes[_j15].nodeValue;
                                        nodes = Object.assign(nodes, _defineProperty({}, _a7, _b7));
                                    }

                                    nodes.parent = node;
                                    nodes.choice = node;
                                    childArr.push(nodes);

                                    if (data) {
                                        data.nodes = childArr;
                                    } else {
                                        vm.childNode = childArr;
                                    }
                                }

                                var ele = select(complexContentWithElementPath, vm.doc);

                                for (var _i25 = 0; _i25 < ele.length; _i25++) {
                                    nodes = {};

                                    for (var _j16 = 0; _j16 < ele[_i25].attributes.length; _j16++) {
                                        var _a8 = ele[_i25].attributes[_j16].nodeName;
                                        var _b8 = ele[_i25].attributes[_j16].nodeValue;
                                        nodes = Object.assign(nodes, _defineProperty({}, _a8, _b8));
                                    }

                                    nodes.parent = node;
                                    childArr.push(nodes);

                                    if (data) {
                                        data.nodes = childArr;
                                    } else {
                                        vm.childNode = childArr;
                                    }
                                }

                                return childArr;
                            }
                        }
                    }
                }
            } else if (select(TypePath, vm.doc).length > 0) {
                parentNode = node;
                var typeElement = select(TypePath, vm.doc);

                if (typeElement.length > 0 && typeElement[0].attributes.length > 0) {
                    for (var _i26 = 0; _i26 < typeElement[0].attributes.length; _i26++) {
                        if (typeElement[0].attributes[_i26].nodeName === 'type') {
                            addTypeChildNode(typeElement[0].attributes[_i26].nodeValue, parentNode, data);
                        }

                        if (typeElement[0].attributes[_i26].nodeValue === 'xs:boolean') {
                            _nodes = Object.assign(_nodes, {
                                values: []
                            });
                            var temp = {};

                            for (var _j17 = 0; _j17 < typeElement[0].attributes.length; _j17++) {
                                var _a9 = typeElement[0].attributes[_j17].nodeName;
                                var _b9 = typeElement[0].attributes[_j17].nodeValue;

                                if (_a9 === 'type') {
                                    _a9 = 'base';
                                }

                                if (_a9 === 'default') {
                                    temp.data = _b9;
                                }

                                temp = Object.assign(temp, _defineProperty({}, _a9, _b9));
                            }

                            temp.parent = node;

                            _nodes.values.push(temp);
                        }
                    }
                }
            }
        };

        function addTypeChildNode(node, parent, data) {
            var parentNode;
            var select = xpath.useNamespaces({
                'xs': 'http://www.w3.org/2001/XMLSchema'
            });
            var complexTypePath = '/xs:schema/xs:complexType[@name=\'' + node + '\']';
            var TypePath = '/xs:schema/xs:element[@name=\'' + node + '\']';
            var nodes = {};
            var childArr = [];
            var element = select(complexTypePath, vm.doc);

            if (element.length > 0) {
                var sequencePath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence';
                var element1 = select(sequencePath, vm.doc);

                if (element1.length > 0) {
                    var childPath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence/xs:element';
                    var childs = select(childPath, vm.doc);

                    if (childs.length > 0) {
                        for (var i = 0; i < childs.length; i++) {
                            nodes = {};

                            for (var j = 0; j < childs[i].attributes.length; j++) {
                                var a = childs[i].attributes[j].nodeName;
                                var b = childs[i].attributes[j].nodeValue;
                                nodes = Object.assign(nodes, _defineProperty({}, a, b));
                            }

                            nodes.parent = parent;
                            childArr.push(nodes);

                            if (data) {
                                data.nodes = childArr;
                            } else {
                                vm.childNode = childArr;
                            }
                        }
                    }

                    var seqChoicePath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence/xs:choice/xs:element';
                    var getChildChoice = select(seqChoicePath, vm.doc);

                    if (getChildChoice.length > 0) {
                        for (var _i27 = 0; _i27 < getChildChoice.length; _i27++) {
                            nodes = {};

                            for (var _j18 = 0; _j18 < getChildChoice[_i27].attributes.length; _j18++) {
                                var _a10 = getChildChoice[_i27].attributes[_j18].nodeName;
                                var _b10 = getChildChoice[_i27].attributes[_j18].nodeValue;
                                nodes = Object.assign(nodes, _defineProperty({}, _a10, _b10));
                            }

                            nodes.parent = parent;
                            nodes.choice = parent;
                            childArr.push(nodes);

                            if (data) {
                                data.nodes = childArr;
                            } else {
                                vm.childNode = childArr;
                            }
                        }
                    }

                    var seqChoiceSeqPath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence/xs:choice/xs:sequence/xs:element';
                    var getChildChoiceSeq = select(seqChoiceSeqPath, vm.doc);

                    if (getChildChoiceSeq.length > 0) {
                        for (var _i28 = 0; _i28 < getChildChoiceSeq.length; _i28++) {
                            nodes = {};

                            for (var _j19 = 0; _j19 < getChildChoiceSeq[_i28].attributes.length; _j19++) {
                                var _a11 = getChildChoiceSeq[_i28].attributes[_j19].nodeName;
                                var _b11 = getChildChoiceSeq[_i28].attributes[_j19].nodeValue;
                                nodes = Object.assign(nodes, _defineProperty({}, _a11, _b11));
                            }

                            nodes.parent = parent;
                            nodes.choice1 = parent;
                            var flag = false;

                            for (var k = 0; k < childArr.length; k++) {
                                if (childArr[k].ref === nodes.ref) {
                                    flag = true;
                                    childArr[k] = Object.assign(childArr[k], nodes);
                                    break;
                                }
                            }

                            if (!flag) {
                                childArr.push(nodes);
                            }

                            if (data) {
                                data.nodes = childArr;
                            } else {
                                vm.childNode = childArr;
                            }
                        }
                    }

                    return childArr;
                }

                var choicePath = '//xs:complexType[@name=\'' + node + '\']/xs:choice';

                if (select(choicePath, vm.doc).length) {
                    var _childPath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:choice/xs:element';

                    var _childs = select(_childPath, vm.doc);

                    if (_childs.length > 0) {
                        for (var _i29 = 0; _i29 < _childs.length; _i29++) {
                            nodes = {};

                            for (var _j20 = 0; _j20 < _childs[_i29].attributes.length; _j20++) {
                                var _a12 = _childs[_i29].attributes[_j20].nodeName;
                                var _b12 = _childs[_i29].attributes[_j20].nodeValue;
                                nodes = Object.assign(nodes, _defineProperty({}, _a12, _b12));
                            }

                            nodes.parent = parent;
                            nodes.choice = parent;
                            childArr.push(nodes);

                            if (data) {
                                data.nodes = childArr;
                            } else {
                                vm.childNode = childArr;
                            }
                        }

                        return childArr;
                    }
                }
            } else if (select(TypePath, vm.doc).length > 0) {
                parentNode = node;
                var typeElement = select(TypePath, vm.doc);

                if (typeElement.length > 0 && typeElement[0].attributes.length > 0) {
                    for (var _i30 = 0; _i30 < typeElement[0].attributes.length; _i30++) {
                        if (typeElement[0].attributes[_i30].nodeName === 'type') {
                            addTypeChildNode(typeElement[0].attributes[_i30].nodeValue, parentNode);
                        }
                    }
                }
            }
        }

        vm.addChild = function (child, nodeArr, check, index) {
            var attrs = checkAttributes(child.ref);
            var text = checkText(child.ref);
            var value = getValues(child.ref);
            var attrsType = getAttrFromType(child.ref, child.parent);
            var valueType = getValueFromType(child.ref, child.parent);
            var val = getVal(child);

            if (_.isEmpty(val) && _.isEmpty(value) && _.isEmpty(valueType)) {
                val = getValFromDefault(child);
            }

            child.recreateJson = true;
            child.nodes = [];
            child.order = index;
            child.uuid = vm.counting;
            nodeArr.expanded = true;
            child.parentId = nodeArr.uuid;
            vm.counting++;

            if (child.nodes && child.nodes.length > 0) {
                child.expanded = true;
            } else {
                child.expanded = false;
            }

            if (!_.isEmpty(attrs)) {
                attachAttrs(attrs, child);
            }

            nodeArr.nodes.push(child);
            nodeArr.nodes = _.orderBy(nodeArr.nodes, ['order'], ['asc']);

            if (check) {
                if (nodeArr && (nodeArr.ref !== "SystemMonitorNotification" || nodeArr.ref === "SystemMonitorNotification" && child.ref !== 'Timer')) {
                    autoAddChild(child);
                }
            }

            if (!_.isEmpty(val)) {
                attachValue(val, nodeArr.nodes);
            }

            if (!_.isEmpty(value)) {
                attachValue(value, nodeArr.nodes);
            }

            if (valueType !== undefined) {
                attachValue(valueType, nodeArr.nodes);
            }

            if (attrsType !== undefined) {
                attachTypeAttrs(attrsType, nodeArr.nodes);
            }

            if (!_.isEmpty(text)) {
                addText(text, nodeArr.nodes);
            }

            printArraya(false);
            vm.selectedNode = child;
            vm.getData(vm.selectedNode);

            if (vm.nodes.length > 0) {
                vm.scrollTreeToGivenId(vm.selectedNode.uuid);
            }

            $scope.changeValidConfigStatus(false);
        };

        function autoAddChild(child) {
            if (vm.autoAddCount === 0) {
                var getCh = vm.checkChildNode(child);

                if (getCh) {
                    for (var i = 0; i < getCh.length; i++) {
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
        } // drag and drop check


        function dragAndDropRules(dragNode, dropNode, e) {
            if (dragNode && dropNode) {
                if (dropNode.ref === dragNode.parent) {
                    var count = 0;

                    if (dragNode.maxOccurs === 'unbounded') {
                        $scope.changeValidConfigStatus(false);
                        dragNode.parentId = angular.copy(dropNode.uuid);
                        return true;
                    } else if (dragNode.maxOccurs !== 'unbounded' && dragNode.maxOccurs !== undefined) {
                        if (dropNode.nodes.length > 0) {
                            for (var i = 0; i < dropNode.nodes.length; i++) {
                                if (dragNode.ref === dropNode.nodes[i].ref) {
                                    count++;
                                }
                            }

                            if (dragNode.maxOccurs != count) {
                                dragNode.parentId = angular.copy(dropNode.uuid);
                            }

                            return dragNode.maxOccurs != count;
                        } else if (dropNode.nodes.length === 0) {
                            $scope.changeValidConfigStatus(false);
                            dragNode.parentId = angular.copy(dropNode.uuid);
                            return true;
                        }
                    } else if (dragNode.maxOccurs === undefined) {
                        if (dropNode.nodes.length > 0) {
                            if (dropNode.nodes.length > 0) {
                                if (dragNode.ref !== dropNode.nodes[0].ref) {
                                    dragNode.parentId = angular.copy(dropNode.uuid);
                                }

                                return dragNode.ref !== dropNode.nodes[0].ref;
                            }
                        } else if (dropNode.nodes.length === 0) {
                            $scope.changeValidConfigStatus(false);
                            dragNode.parentId = angular.copy(dropNode.uuid);
                            return true;
                        }
                    }
                }
            }

            return false;
        }

        vm.changeLastUUid = function (node) {
            vm.lastScrollId = angular.copy(node.uuid);
        }; // to send data in details component


        vm.getData = function (evt) {
            if (evt && evt.keyref) {
                for (var i = 0; i < evt.attributes.length; i++) {
                    if (evt.attributes[i].name === evt.keyref) {
                        vm.getDataAttr(evt.attributes[i].refer);
                        break;
                    }
                }
            }

            if (evt.ref === 'Body') {
                setTimeout(function () {
                    initEditor(evt.values[0]);
                }, 10);
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
        }; // validation for node value property


        vm.validValue = function (value, ref, tag) {
            if (/^\s*$/.test(value)) {
                vm.error = true;
                vm.text = 'Required Field';
                vm.errorName = {
                    e: ref
                };

                if (tag.data !== undefined) {
                    for (var key in tag) {
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
                vm.errorName = {
                    e: ref
                };

                if (tag.data !== undefined) {
                    for (var key in tag) {
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
            var temp;

            for (var i = 0; i < childNode.length; i++) {
                if (childNode[i].ref === refer) {
                    if (childNode[i].key) {
                        temp = childNode[i].key;

                        if (childNode[i] && childNode[i].attributes) {
                            for (var j = 0; j < childNode[i].attributes.length; j++) {
                                if (childNode[i].attributes[j].name === temp) {
                                    if (childNode[i].attributes[j] && childNode[i].attributes[j].data) {
                                        vm.tempArr.push(childNode[i].attributes[j].data);
                                    }
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
        } // BreadCrumb


        function createBreadCrumb(node) {
            if (vm.nodes[0] && vm.nodes[0].ref === node.parent && vm.nodes[0].uuid === node.parentId) {
                vm.breadCrumbArray.push(vm.nodes[0]);
            } else {
                if (vm.nodes[0] && vm.nodes[0].nodes && vm.nodes[0].nodes.length > 0) {
                    for (var i = 0; i < vm.nodes[0].nodes.length; i++) {
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
                    for (var i = 0; i < nodes.nodes.length; i++) {
                        createBreadCrumbRecursively(node, nodes.nodes[i]);
                    }
                }
            }
        }

        function addText(text, child) {
            if (child.length > 0) {
                for (var i = 0; i < child.length; i++) {
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
            for (var i = 0; i < child.length; i++) {
                if (attrs[0] && attrs[0].parent === child[i].ref && attrs[0].grandFather === child[i].parent) {
                    if (!child[i].attributes) {
                        child[i].attributes = [];

                        for (var j = 0; j < attrs.length; j++) {
                            checkAttrsText(attrs[i]);
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
                        for (var _j21 = 0; _j21 < attrs.length; _j21++) {
                            checkAttrsText(attrs[i]);
                            checkAttrsValue(attrs[_j21]);
                            attrs[_j21].id = vm.counting;

                            if (attrs[_j21].default) {
                                attrs[_j21].data = attrs[_j21].default;
                            }

                            vm.counting++;
                            child[i].attributes.push(attrs[_j21]);
                        }

                        printArraya(false);
                    }
                }
            }
        }

        function attachValue(value, child) {
            if (value && value.length > 0 && value[0].grandFather) {
                for (var i = 0; i < child.length; i++) {
                    if (value[0] && value[0].parent === child[i].ref && value[0].grandFather === child[i].parent) {
                        if (!child[i].values) {
                            child[i].values = [];

                            for (var j = 0; j < value.length; j++) {
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
                    for (var _i31 = 0; _i31 < child.length; _i31++) {
                        if (value && value[0] && value[0].parent === child[_i31].ref) {
                            if (!child[_i31].values) {
                                child[_i31].values = [];

                                for (var _j22 = 0; _j22 < value.length; _j22++) {
                                    value[_j22].uuid = vm.counting;
                                    vm.counting++;

                                    child[_i31].values.push(value[_j22]);

                                    if (value[_j22].base === 'password') {
                                        value[_j22].pShow = false;
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
            var select = xpath.useNamespaces({
                'xs': 'http://www.w3.org/2001/XMLSchema'
            });
            var attrTypePath = '/xs:schema/xs:element[@name=\'' + node.ref + '\']/@default';
            var ele = select(attrTypePath, vm.doc);
            var valueArr = [];
            var value = {};

            for (var i = 0; i < ele.length; i++) {
                value.base = 'xs:string';
                value.parent = node.ref;
                value.grandFather = node.parent;
                value.data = ele[i].nodeValue;
            }

            if (!_.isEmpty(value)) {
                valueArr.push(value);
            }

            return valueArr;
        }

        function getVal(nodeValue) {
            var select = xpath.useNamespaces({
                'xs': 'http://www.w3.org/2001/XMLSchema'
            });
            var attrTypePath = '/xs:schema/xs:element[@name=\'' + nodeValue.ref + '\']/@type';
            var ele = select(attrTypePath, vm.doc);
            var valueArr = [];
            var value = {};

            for (var i = 0; i < ele.length; i++) {
                if (ele[i].nodeValue === 'xs:string' || ele[i].nodeValue === 'xs:long' || ele[i].nodeValue === 'xs:positiveInteger') {
                    value.base = ele[i].nodeValue;
                    value.parent = nodeValue.ref;
                    value.grandFather = nodeValue.parent;
                }

                if (!_.isEmpty(value)) {
                    valueArr.push(value);
                }
            }

            return valueArr;
        }

        function attachAttrs(attrs, child) {
            if (!child.attribute) {
                child.attributes = [];

                for (var j = 0; j < attrs.length; j++) {
                    checkAttrsValue(attrs[j]);
                    checkAttrsText(attrs[j]);
                    attrs[j].id = vm.counting;
                    vm.counting++;

                    if (attrs[j].default && !attrs[j].data) {
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
            var select = xpath.useNamespaces({
                'xs': 'http://www.w3.org/2001/XMLSchema'
            });
            var attrTypePath = '/xs:schema/xs:element[@name=\'' + nodeValue + '\']/@type';
            var element = select(attrTypePath, vm.doc);
            var attribute = {};

            if (element.length > 0) {
                var ele = select(attrTypePath, vm.doc);

                for (var i = 0; i < ele.length; i++) {
                    var a = ele[i].nodeName;
                    var b = ele[i].nodeValue;
                    attribute = Object.assign(attribute, _defineProperty({}, a, b));
                }

                attribute.parent = nodeValue;
                attribute.grandFather = parentNode;
            }

            return getAttrsFromType(attribute);
        }

        function getAttrsFromType(node) {
            var select = xpath.useNamespaces({
                'xs': 'http://www.w3.org/2001/XMLSchema'
            });
            var attrTypePath = '/xs:schema/xs:complexType[@name=\'' + node.type + '\']/xs:simpleContent/xs:extension/xs:attribute/@*';
            var element = select(attrTypePath, vm.doc);
            var attrArr = [];
            var attribute = {};

            if (element.length > 0) {
                for (var i = 0; i < element.length; i++) {
                    var a = element[i].nodeName;
                    var b = element[i].nodeValue;
                    attribute = Object.assign(attribute, _defineProperty({}, a, b));
                }

                attribute.parent = node.parent;
                attribute.grandFather = node.grandFather;
                var value = getAttrsValueFromType(attribute, node);

                if (value.length > 0) {
                    attribute.values = value;
                }

                attrArr.push(attribute);
                return attrArr;
            }
        }

        function getAttrsValueFromType(attr, node) {
            var select = xpath.useNamespaces({
                'xs': 'http://www.w3.org/2001/XMLSchema'
            });
            var valueTypePath = '//xs:complexType[@name=\'' + node.type + '\']/xs:simpleContent/xs:extension/xs:attribute[@name=\'' + attr.name + '\']/xs:simpleType/xs:restriction/xs:enumeration';
            var element = select(valueTypePath, vm.doc);
            var valueArr = [];

            if (element.length > 0) {
                for (var i = 0; i < element.length; i++) {
                    var value = {};

                    for (var j = 0; j < element[i].attributes.length; j++) {
                        var a = element[i].attributes[j].nodeName;
                        var b = element[i].attributes[j].nodeValue;
                        value = Object.assign(value, _defineProperty({}, a, b));
                    }

                    valueArr.push(value);
                }

                return valueArr;
            }
        }

        function getValueFromType(nodeValue, parentNode) {
            var select = xpath.useNamespaces({
                'xs': 'http://www.w3.org/2001/XMLSchema'
            });
            var attrTypePath = '/xs:schema/xs:element[@name=\'' + nodeValue + '\']/@type';
            var ele = select(attrTypePath, vm.doc);
            var attribute = {};

            if (ele.length > 0) {
                for (var i = 0; i < ele.length; i++) {
                    var a = ele[i].nodeName;
                    var b = ele[i].nodeValue;
                    attribute = Object.assign(attribute, _defineProperty({}, a, b));
                }

                attribute.parent = nodeValue;
                attribute.grandFather = parentNode;
            }

            return getTypeValue(attribute);
        }

        function getTypeValue(node) {
            if (node.type !== 'xs:boolean') {
                var select = xpath.useNamespaces({
                    'xs': 'http://www.w3.org/2001/XMLSchema'
                });
                var extensionTypePath = '/xs:schema/xs:complexType[@name=\'' + node.type + '\']/xs:simpleContent/xs:extension/@*';
                var element = select(extensionTypePath, vm.doc);
                var value = {};
                var valueArr = [];
                var b;

                if (element.length > 0) {
                    if (element[0] && element[0].nodeValue === 'NotEmptyType') {
                        var a = element[0].nodeName;
                        var x = element[0].nodeValue;
                        value = Object.assign(value, _defineProperty({}, a, x));
                        var simpleTypePath = '/xs:schema/xs:simpleType[@name=\'' + value.base + '\']/xs:restriction/@*';
                        element = select(simpleTypePath, vm.doc);

                        if (element.length > 0) {
                            a = element[0].nodeName;
                            b = element[0].nodeValue;
                            value = Object.assign(value, _defineProperty({}, a, b));
                            var minLengthPath = '/xs:schema/xs:simpleType[@name=\'' + x + '\']/xs:restriction/xs:minLength/@*';
                            element = select(minLengthPath, vm.doc);
                            a = element[0].nodeName;
                            b = element[0].nodeValue;
                            value = Object.assign(value, _defineProperty({}, a, b));
                        }

                        value.parent = node.parent;
                        value.grandFather = node.grandFather;
                    }

                    if (!_.isEmpty(value)) {
                        valueArr.push(value);
                    }

                    return valueArr;
                }
            } else {
                var _value;

                var _valueArr = [];
                _value = Object.assign(node, {
                    base: node.type
                });

                if (!_.isEmpty(_value)) {
                    _valueArr.push(_value);
                }

                return _valueArr;
            }
        }

        function getValues(node) {
            var select = xpath.useNamespaces({
                'xs': 'http://www.w3.org/2001/XMLSchema'
            });
            var extensionPath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:simpleContent/xs:extension/@*';
            var value = {};
            var valueArr = [];
            var b;
            var element = select(extensionPath, vm.doc);

            if (element[0] && element[0].nodeValue !== 'NotEmptyType') {
                var a = element[0].nodeName;
                var x = element[0].nodeValue;
                value = Object.assign(value, _defineProperty({}, a, x));
                var defultPath = '//xs:element[@name=\'' + node + '\']/@*';
                var defAttr = select(defultPath, vm.doc);

                if (defAttr.length > 0) {
                    for (var s = 0; s < defAttr.length; s++) {
                        if (defAttr[s].nodeName === 'default') {
                            value.default = defAttr[s].nodeValue;
                            value.data = defAttr[s].nodeValue;
                        }
                    }
                }
            }

            if (element[0] && element[0].nodeValue === 'NotEmptyType') {
                var _a13 = element[0].nodeName;
                var _x2 = element[0].nodeValue;
                value = Object.assign(value, _defineProperty({}, _a13, _x2));
                var simpleTypePath = '//xs:simpleType[@name=\'' + value.base + '\']/xs:restriction/@*';
                element = select(simpleTypePath, vm.doc);

                if (element.length > 0) {
                    _a13 = element[0].nodeName;
                    b = element[0].nodeValue;
                    value = Object.assign(value, _defineProperty({}, _a13, b));
                    var minLengthPath = '//xs:simpleType[@name=\'' + _x2 + '\']/xs:restriction/xs:minLength/@*';
                    element = select(minLengthPath, vm.doc);
                    _a13 = element[0].nodeName;
                    b = element[0].nodeValue;
                    value = Object.assign(value, _defineProperty({}, _a13, b));
                }

                var _defultPath = '//xs:element[@name=\'' + node + '\']/@*';

                var _defAttr = select(_defultPath, vm.doc);

                if (_defAttr.length > 0) {
                    for (var _s = 0; _s < _defAttr.length; _s++) {
                        if (_defAttr[_s].nodeName === 'default') {
                            value.default = _defAttr[_s].nodeValue;
                            value.data = _defAttr[_s].nodeValue;
                        }
                    }
                }

                value.parent = node;
            } else {
                var extensionPath1 = '//xs:element[@name=\'' + node + '\']/xs:simpleType/xs:restriction/@*';
                element = select(extensionPath1, vm.doc);

                if (element.length > 0) {
                    var _a14 = element[0].nodeName;
                    var c = element[0].nodeValue;
                    value = Object.assign(value, _defineProperty({}, _a14, c));

                    var _defultPath2 = '//xs:element[@name=\'' + node + '\']/@*';

                    var _defAttr2 = select(_defultPath2, vm.doc);

                    if (_defAttr2.length > 0) {
                        for (var _s2 = 0; _s2 < _defAttr2.length; _s2++) {
                            if (_defAttr2[_s2].nodeName === 'default') {
                                value.default = _defAttr2[_s2].nodeValue;
                                value.data = _defAttr2[_s2].nodeValue;
                            }
                        }
                    }

                    var _minLengthPath = '//xs:element[@name=\'' + node + '\']/xs:simpleType/xs:restriction/xs:minLength/@*';

                    element = select(_minLengthPath, vm.doc);
                    var enumPath = '//xs:element[@name=\'' + node + '\']/xs:simpleType/xs:restriction/xs:enumeration/@*';
                    var ele = select(enumPath, vm.doc);

                    if (element.length > 0) {
                        _a14 = element[0].nodeName;
                        b = element[0].nodeValue;
                        value = Object.assign(value, _defineProperty({}, _a14, b));
                        var defultPath1 = '//xs:element[@name=\'' + node + '\']/@*';

                        var _defAttr3 = select(defultPath1, vm.doc);

                        if (_defAttr3.length > 0) {
                            for (var _s3 = 0; _s3 < _defAttr3.length; _s3++) {
                                if (_defAttr3[_s3].nodeName === 'default') {
                                    value.default = _defAttr3[_s3].nodeValue;
                                    value.data = _defAttr3[_s3].nodeValue;
                                }
                            }
                        }
                    }

                    if (ele.length > 0) {
                        value.values = [];

                        for (var i = 0; i < ele.length; i++) {
                            var z = {};
                            var _x3 = ele[i].nodeName;
                            var y = ele[i].nodeValue;
                            z = Object.assign(z, _defineProperty({}, _x3, y));
                            value.values.push(z);
                        }

                        var defultPath2 = '//xs:element[@name=\'' + node + '\']/@*';

                        var _defAttr4 = select(defultPath2, vm.doc);

                        if (_defAttr4.length > 0) {
                            for (var _s4 = 0; _s4 < _defAttr4.length; _s4++) {
                                if (_defAttr4[_s4].nodeName === 'default') {
                                    value.default = _defAttr4[_s4].nodeValue;
                                    value.data = _defAttr4[_s4].nodeValue;
                                }
                            }
                        }
                    }
                }

                if (!_.isEmpty(value)) {
                    value.parent = node;
                }
            }

            var xmlEditorPath = '//xs:element[@name=\'' + node + '\']/xs:annotation/xs:appinfo/XmlEditor/@type';
            var attr = select(xmlEditorPath, vm.doc);

            if (attr.length > 0) {
                value.base = attr[0].nodeValue;
            }

            if (_.isEmpty(value)) {
                var _x4;

                var valueFromXmlEditorPath = '//xs:element[@name=\'' + node + '\']/xs:annotation/xs:appinfo/XmlEditor';
                var attr1 = select(valueFromXmlEditorPath, vm.doc);

                if (attr1.length > 0) {
                    if (attr1[0].attributes && attr1[0].attributes.length > 0) {
                        for (var _i32 = 0; _i32 < attr1[0].attributes.length; _i32++) {
                            if (attr1[0].attributes[_i32].nodeName === 'type') {
                                _x4 = attr1[0].attributes[_i32].nodeValue;
                                break;
                            }
                        }

                        if (_x4 !== undefined) {
                            value.base = _x4;
                            value.parent = node;
                        } else {
                            value.base = 'xs:string';
                            value.parent = node;
                        }
                    }
                }
            }

            if (!_.isEmpty(value)) {
                valueArr.push(value);
            }

            return valueArr;
        }

        function checkAttrsValue(attrs) {
            var select = xpath.useNamespaces({
                'xs': 'http://www.w3.org/2001/XMLSchema'
            });
            var enumerationPath = '//xs:element[@name=\'' + attrs.parent + '\']//xs:complexType/xs:simpleContent/xs:extension/xs:attribute[@name=\'' + attrs.name + '\']/xs:simpleType/xs:restriction/xs:enumeration';
            var valueArr = [];
            var valueJson = {};
            var value = select(enumerationPath, vm.doc);

            if (value.length > 0) {
                for (var i = 0; i < value.length; i++) {
                    valueJson = {};

                    for (var j = 0; j < value[i].attributes.length; j++) {
                        var a = value[i].attributes[j].nodeName;
                        var b = value[i].attributes[j].nodeValue;
                        valueJson = Object.assign(valueJson, _defineProperty({}, a, b));
                    }

                    valueArr.push(valueJson);
                }

                if (!attrs.values) {
                    attrs.values = [];

                    for (var _i33 = 0; _i33 < valueArr.length; _i33++) {
                        attrs.values.push(valueArr[_i33]);
                    }
                }
            } else {
                var _enumerationPath = '//xs:element[@name=\'' + attrs.parent + '\']//xs:complexType/xs:attribute[@name=\'' + attrs.name + '\']/xs:simpleType/xs:restriction/xs:enumeration';

                value = select(_enumerationPath, vm.doc);

                for (var _i34 = 0; _i34 < value.length; _i34++) {
                    valueJson = {};

                    for (var _j23 = 0; _j23 < value[_i34].attributes.length; _j23++) {
                        var _a15 = value[_i34].attributes[_j23].nodeName;
                        var _b13 = value[_i34].attributes[_j23].nodeValue;
                        valueJson = Object.assign(valueJson, _defineProperty({}, _a15, _b13));
                    }

                    valueArr.push(valueJson);
                }

                if (!attrs.values) {
                    attrs.values = [];

                    for (var _i35 = 0; _i35 < valueArr.length; _i35++) {
                        attrs.values.push(valueArr[_i35]);
                    }
                }
            }
        }

        function getChildNodes(childElement, tagName, tempNode) {
            if (childElement && childElement.getElementsByTagName('xs:complexType') !== undefined) {
                var rootChildChilds = childElement.getElementsByTagName('xs:complexType');

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
                        var x = rootChildChilds[0].getAttributeNode('base');

                        if (x.nodeValue !== 'NotEmptyType' && x.nodeValue !== 'xs:anyURI') {
                            getChildFromBase(x, tagName, tempNode);
                        }
                    }
                }
            }
        }

        function getChildFromBase(child, tagName, tempNode) {
            if (vm.doc.getElementsByTagName('xs:complexType') !== undefined) {
                var rootChildChilds = vm.doc.getElementsByTagName('xs:complexType');
            }

            var rootChildChildsarr = [];
            var childElement;
            var count = 0;

            for (var i = 0; i < rootChildChilds.length; i++) {
                if (rootChildChilds.item(i).getAttributeNode('name') !== undefined) {
                    rootChildChildsarr[count] = rootChildChilds.item(i).getAttributeNode('name');
                    count++;

                    for (var j = 0; j < rootChildChildsarr.length; j++) {
                        if (rootChildChildsarr[j] && rootChildChildsarr[j].nodeValue === child.nodeValue) {
                            childElement = rootChildChildsarr[j].ownerElement;
                        }
                    }
                }
            }

            getChildNodes(childElement, tagName, tempNode);
        }

        function getTypeNode(rootChildChilds, tagName, tempNode) {
            var child = rootChildChilds.nodeValue;
            child = {
                type: child
            };
            getTChildNode(child.type, tagName, tempNode);
        }

        function getTChildNode(child, tagName, tempNode) {
            if (vm.doc.getElementsByTagName('xs:complexType') !== undefined) {
                var rootChildChilds = vm.doc.getElementsByTagName('xs:complexType');
            }

            var rootChildChildsarr = [];
            var childElement;
            var count = 0;

            for (var i = 0; i < rootChildChilds.length; i++) {
                if (rootChildChilds.item(i).getAttributeNode('name') !== undefined) {
                    rootChildChildsarr[count] = rootChildChilds.item(i).getAttributeNode('name');
                    count++;

                    for (var j = 0; j < rootChildChildsarr.length; j++) {
                        if (rootChildChildsarr[j] && rootChildChildsarr[j].nodeValue === child) {
                            childElement = rootChildChildsarr[j].ownerElement;
                        }
                    }
                }
            }

            getChildNodes(childElement, tagName, tempNode);
        } // key and Key Ref Implementation code


        function xpathFunc() {
            var select = xpath.useNamespaces({
                'xs': 'http://www.w3.org/2001/XMLSchema'
            });
            var a;

            if (vm.nodes[0]) {
                a = vm.nodes[0].ref;
            }

            var keyPath = '/xs:schema/xs:element[@name=\'' + a + '\']/xs:key/@name';
            var keyRefPath = '/xs:schema/xs:element[@name=\'' + a + '\']/xs:keyref';
            var keyattrs = {};

            if (!vm.keyRefNodes || vm.keyRefNodes.length == 0) {
                vm.keyRefNodes = select(keyRefPath, vm.doc);
            }

            if (!vm.keyNodes || vm.keyNodes.length == 0) {
                vm.keyNodes = select(keyPath, vm.doc);
            }

            if (vm.keyNodes.length > 0) {
                for (var i = 0; i < vm.keyNodes.length; i++) {
                    var key = vm.keyNodes[i].nodeName;
                    var value = strReplace(vm.keyNodes[i].nodeValue);
                    keyattrs = Object.assign(keyattrs, _defineProperty({}, key, value));

                    for (var j = 0; j < vm.keyNodes[i].ownerElement.childNodes.length; j++) {
                        if (vm.keyNodes[i].ownerElement.childNodes[j].nodeName === 'xs:field') {
                            for (var k = 0; k < vm.keyNodes[i].ownerElement.childNodes[j].attributes.length; k++) {
                                keyattrs.key = strReplace(vm.keyNodes[i].ownerElement.childNodes[j].attributes[k].nodeValue);
                            }

                            break;
                        }
                    }

                    attachKey(keyattrs);
                }
            }

            if (vm.keyRefNodes.length > 0) {
                for (var _i36 = 0; _i36 < vm.keyRefNodes.length; _i36++) {
                    getKeyRef(vm.keyRefNodes[_i36]);
                }
            }
        }

        function getKeyRef(keyRefNodes) {
            var attrs = {};

            for (var i = 0; i < keyRefNodes.attributes.length; i++) {
                var key = keyRefNodes.attributes[i].nodeName;
                var value = strReplace(keyRefNodes.attributes[i].nodeValue);
                attrs = Object.assign(attrs, _defineProperty({}, key, value));

                for (var j = 0; j < keyRefNodes.attributes[0].ownerElement.childNodes.length; j++) {
                    if (keyRefNodes.attributes[0].ownerElement.childNodes[j].nodeName === 'xs:field') {
                        for (var k = 0; k < keyRefNodes.attributes[0].ownerElement.childNodes[j].attributes.length; k++) {
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
            addKeyAndKeyRef(key);
        }

        function attachKeyRefNodes(keyrefnodes) {
            addKeyAndKeyRef(keyrefnodes);
        }

        function addKeyAndKeyRef(nodes) {
            var k = false;
            var keyre = false;

            for (var key in nodes) {
                if (key === 'key') {
                    k = true;
                    break;
                } else if (key === 'keyref') {
                    keyre = true;
                    break;
                }
            }

            if (vm.nodes[0] && vm.nodes[0].nodes) {
                for (var i = 0; i < vm.nodes[0].nodes.length; i++) {
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
                var ke = false;
                var keyref = false;

                for (var _key6 in _nodes) {
                    if (_key6 === 'key') {
                        ke = true;
                        break;
                    } else if (_key6 === 'keyref') {
                        keyref = true;
                        break;
                    }
                }

                for (var _i37 = 0; _i37 < child.length; _i37++) {
                    if (child[_i37].ref === _nodes.name) {
                        if (ke) {
                            child[_i37].key = _nodes.key;
                        } else if (keyref) {
                            child[_i37].keyref = _nodes.keyref;

                            if (child[_i37].attributes) {
                                for (var j = 0; j < child[_i37].attributes.length; j++) {
                                    if (child[_i37].attributes[j].name === _nodes.keyref) {
                                        child[_i37].attributes[j].refer = _nodes.refer;
                                    }
                                }
                            }
                        }
                    } else {
                        if (child[_i37].nodes) {
                            recursion(_nodes, child[_i37].nodes);
                        }
                    }
                }
            }
        } // Remove Node


        vm.deleteNode = function (node) {
            vm.dRefFlag = 0;
            $scope.changeValidConfigStatus(false);

            if (node.parent === '#') {} else {
                vm.isNext = false;
                getParent(node, vm.nodes[0]);
            }

            if (vm.selectedNode.ref === node.ref) {
                vm.selectedNode = vm.nodes[0];
                vm.getIndividualData(vm.selectedNode);
            }
        };

        function getParent(node, list) {
            if (node.parentId === list.uuid && list.parent == '#') {
                deleteData(list.nodes, node, list);
            } else {
                if (list.nodes) {
                    for (var i = 0; i < list.nodes.length; i++) {
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
                for (var i = 0; i < parentNode.length; i++) {
                    if (node.ref === parentNode[i].ref && node.uuid == parentNode[i].uuid) {
                        parentNode.splice(i, 1);
                        printArraya(false);
                        vm.getIndividualData(parent);
                        vm.isNext = false;
                    }
                }

                if (node.key) {
                    checkRefPresent(node, vm.nodes[0]);
                }
            }
        }

        function checkRefPresent(node, child) {
            if (child.ref == node.ref) {
                if (child.attributes) {
                    for (var i = 0; i < child.attributes.length; i++) {
                        for (var j = 0; j < node.attributes.length; j++) {
                            if (child.attributes[i].name == node.attributes[j].name) {
                                vm.dRefFlag++;
                                break;
                            }
                        }
                    }
                }
            } else {
                if (child.nodes && child.nodes.length > 0) {
                    for (var _i38 = 0; _i38 < child.nodes.length; _i38++) {
                        checkRefPresent(node, child.nodes[_i38]);
                    }
                }
            }

            if (vm.dRefFlag < 1) {
                if (vm.nodes[0].keyref) {
                    if (vm.nodes[0].attributes.length > 0) {
                        for (var _i39 = 0; _i39 < vm.nodes[0].attributes.length; _i39++) {
                            if (vm.nodes[0].keyref === vm.nodes[0].attributes[_i39].name) {
                                for (var _j24 = 0; _j24 < node.attributes.length; _j24++) {
                                    if (node.attributes[_j24].name == node.key) {
                                        if (vm.nodes[0].attributes[_i39].data == node.attributes[_j24].data) {
                                            for (var key in vm.nodes[0].attributes[_i39]) {
                                                if (key == 'data') {
                                                    delete vm.nodes[0].attributes[_i39][key];
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
                        for (var _i40 = 0; _i40 < vm.nodes[0].nodes.length; _i40++) {
                            deleteKeyRefData(vm.nodes[0].nodes[_i40], node);
                        }
                    }
                }
            }
        }

        function deleteKeyRefData(child, node) {
            if (child.ref === node.ref + 'Ref') {
                if (child.keyref) {
                    if (child && child.attributes && child.attributes.length > 0) {
                        for (var i = 0; i < child.attributes.length; i++) {
                            if (child.keyref === child.attributes[i].name && node && node.attributes) {
                                for (var j = 0; j < node.attributes.length; j++) {
                                    if (node.attributes[j].name == node.key) {
                                        if (child.attributes[i].data == node.attributes[j].data) {
                                            for (var key in child.attributes[i]) {
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
                        for (var _i41 = 0; _i41 < child.nodes.length; _i41++) {
                            deleteKeyRefData(child.nodes[_i41], node);
                        }
                    }
                }
            }
        } // Cut Node


        vm.cutNode = function (node) {
            $scope.changeValidConfigStatus(false);
            vm.copyItem = {};
            vm.copyItem = Object.assign(vm.copyItem, node);
            vm.cutData = true;

            if (vm.XSDState && vm.XSDState.message && vm.XSDState.message.code == 'XMLEDITOR-101') {
                vm.XSDState.message.code = 'XMLEDITOR-104';
            }
        }; // searchNode


        function searchAndRemoveNode(node) {
            if (node.parent === vm.nodes[0].ref && node.parentId == vm.nodes[0].uuid) {
                for (var i = 0; i < vm.nodes[0].nodes.length; i++) {
                    if (node.uuid == vm.nodes[0].nodes[i].uuid) {
                        vm.nodes[0].nodes.splice(i, 1);
                    }
                }
            } else {
                for (var _i42 = 0; _i42 < vm.nodes[0].nodes.length; _i42++) {
                    searchAndRemoveNodeRecursion(node, vm.nodes[0].nodes[_i42]);
                }
            }
        } // searchNodeRecursion


        function searchAndRemoveNodeRecursion(node, child) {
            if (node.parent === child.ref && node.parentId == child.uuid) {
                for (var i = 0; i < child.nodes.length; i++) {
                    if (node.uuid == child.nodes[i].uuid) {
                        child.nodes.splice(i, 1);
                    }
                }
            } else {
                for (var _i43 = 0; _i43 < child.nodes.length; _i43++) {
                    searchAndRemoveNodeRecursion(node, child.nodes[_i43]);
                }
            }
        } // Copy Node


        vm.copyNode = function (node) {
            vm.copyItem = undefined;
            vm.cutData = false;

            for (var key in node) {
                if (_typeof(node[key]) == 'object') {
                    vm.copyItem = Object.assign({}, vm.copyItem, _defineProperty({}, key, []));

                    if ((key === 'attributes' || key === 'values') && node[key].length > 0) {
                        for (var i = 0; i < node[key].length; i++) {
                            var temp = {};

                            for (var a in node[key][i]) {
                                if (a == 'id') {
                                    temp = Object.assign(temp, _defineProperty({}, a, vm.counting));
                                    vm.counting++;
                                } else {
                                    temp = Object.assign(temp, _defineProperty({}, a, node[key][i][a]));
                                }
                            }

                            vm.copyItem[key].push(Object.assign({}, temp));
                        }
                    } else if (key === 'nodes' && node[key].length > 0) {
                        for (var _i44 = 0; _i44 < node[key].length; _i44++) {
                            var _a16 = copyNodeRecursion(node[key][_i44]);

                            vm.copyItem[key].push(_a16);
                        }
                    } else if (key === 'text') {
                        vm.copyItem = Object.assign({}, vm.copyItem, _defineProperty({}, key, node[key]));
                    }
                } else {
                    vm.copyItem = Object.assign({}, vm.copyItem, _defineProperty({}, key, node[key]));
                }
            }
        };

        function copyNodeRecursion(node) {
            var tempa = {};

            for (var key in node) {
                if (_typeof(node[key]) == 'object') {
                    tempa = Object.assign({}, tempa, _defineProperty({}, key, []));

                    if ((key === 'attributes' || key === 'values') && node[key].length > 0) {
                        for (var i = 0; i < node[key].length; i++) {
                            var temp = {};

                            for (var a in node[key][i]) {
                                if (a == 'id') {
                                    temp = Object.assign(temp, _defineProperty({}, a, vm.counting));
                                    vm.counting++;
                                } else {
                                    temp = Object.assign(temp, _defineProperty({}, a, node[key][i][a]));
                                }
                            }

                            tempa[key].push(Object.assign({}, temp));
                        }
                    } else if (key === 'nodes' && node[key].length > 0) {
                        for (var _i45 = 0; _i45 < node[key].length; _i45++) {
                            var _a17 = copyNodeRecursion(node[key][_i45]);

                            tempa[key].push(_a17);
                        }
                    } else if (key === 'text') {
                        tempa = Object.assign({}, tempa, _defineProperty({}, key, node[key]));
                    }
                } else {
                    tempa = Object.assign({}, tempa, _defineProperty({}, key, node[key]));
                }
            }

            return tempa;
        } // check rules before paste


        vm.checkRules = function (pasteNode, copyNode) {
            if (copyNode !== undefined) {
                vm.checkRule = false;

                if (pasteNode.ref === copyNode.parent) {
                    var count = 0;

                    if (copyNode.maxOccurs === 'unbounded') {
                        vm.checkRule = true;
                    } else if (copyNode.maxOccurs !== 'unbounded' && copyNode.maxOccurs !== undefined) {
                        if (pasteNode.nodes.length > 0) {
                            for (var i = 0; i < pasteNode.nodes.length; i++) {
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
                            for (var _i46 = 0; _i46 < pasteNode.nodes.length; _i46++) {
                                if (copyNode.ref === pasteNode.nodes[_i46].ref) {
                                    vm.checkRule = false;
                                    break;
                                }
                            }
                        } else if (pasteNode.nodes.length === 0) {
                            vm.checkRule = true;
                        }
                    }
                } else {
                    vm.checkRule = false;
                }
            } else {
                vm.checkRule = false;
            }
        }; // Paste Node


        vm.pasteNode = function (node) {
            if (vm.cutData) {
                searchAndRemoveNode(vm.copyItem);
            }

            vm.copyItem.uuid = node.uuid + vm.counting;
            vm.counting++;

            if (vm.copyItem && !vm.copyItem.order) {
                var a = vm.checkChildNode(node);

                if (a && a.length > 0) {
                    for (var i = 0; i < a.length; i++) {
                        if (a[i].ref === vm.copyItem.ref) {
                            vm.copyItem.order = i;
                            break;
                        }
                    }
                }
            }

            if (vm.copyItem.nodes) {
                vm.copyItem.nodes.forEach(function (node) {
                    changeUuId(node, vm.copyItem.uuid);
                    changeParentId(node, vm.copyItem.uuid);
                });
            }

            var copyData = angular.copy(vm.copyItem);

            if (node.ref === 'Profiles' && $location.path().split('/')[2] == 'yade' && !vm.cutData) {
                var tName;

                if (copyData && copyData.attributes) {
                    for (var _i47 = 0; _i47 < copyData.attributes.length; _i47++) {
                        if (copyData.attributes[_i47].name === 'profile_id' && copyData.attributes[_i47].data) {
                            for (var j = 0; j < node.nodes.length; j++) {
                                for (var k = 0; k < node.nodes[j].attributes.length; k++) {
                                    if (node.nodes[j].attributes[k].name == 'profile_id' && node.nodes[j].attributes[k].data) {
                                        if (node.nodes[j].attributes[k].data.match(/-copy[0-9]+/i)) {
                                            tName = angular.copy(node.nodes[j].attributes[k].data);
                                        }

                                        break;
                                    }
                                }
                            }
                        }

                        if (!tName && copyData.attributes[_i47].data) {
                            tName = copyData.attributes[_i47].data + '-copy1';
                        } else if (tName) {
                            tName = tName.split('-copy')[1];
                            tName = parseInt(tName) || 0;
                            tName = (copyData.attributes[_i47].data || 'profile') + '-copy' + (tName + 1);
                        }

                        if (tName) copyData.attributes[_i47].data = angular.copy(tName);
                        break;
                    }
                }
            }

            node.nodes.push(angular.copy(copyData));
            node.nodes = _.orderBy(node.nodes, ['order'], ['asc']);
            vm.cutData = false;
            vm.checkRule = true;
            printArraya(false);
            vm.selectedNode = copyData;
            vm.getIndividualData(vm.selectedNode);
            vm.scrollTreeToGivenId(vm.selectedNode.uuid);
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

        function jsonToXml() {
            if (vm.nodes.length > 0) {
                var doc = document.implementation.createDocument('', '', null);
                var peopleElem = doc.createElement(vm.nodes[0].ref);

                if (peopleElem) {
                    if (vm.nodes[0].attributes && vm.nodes[0].attributes.length > 0) {
                        for (var i = 0; i < vm.nodes[0].attributes.length; i++) {
                            if (vm.nodes[0].attributes[i].data) {
                                peopleElem.setAttribute(vm.nodes[0].attributes[i].name, vm.nodes[0].attributes[i].data);
                            }
                        }
                    }

                    if (vm.nodes[0] && vm.nodes[0].values && vm.nodes[0].values.length >= 0) {
                        for (var _i48 = 0; _i48 < vm.nodes[0].values.length; _i48++) {
                            if (vm.nodes[0].values[0].data) {
                                peopleElem.createCDATASection(vm.nodes[0].values[0].data);
                            }
                        }
                    }

                    if (vm.nodes[0].nodes && vm.nodes[0].nodes.length > 0) {
                        for (var _i49 = 0; _i49 < vm.nodes[0].nodes.length; _i49++) {
                            createChildJson(peopleElem, vm.nodes[0].nodes[_i49], doc.createElement(vm.nodes[0].nodes[_i49].ref), doc);
                        }
                    }
                }

                return peopleElem;
            }
        }

        function createChildJson(node, childrenNode, currentNode, doc) {
            if (childrenNode && childrenNode.attributes) {
                for (var i = 0; i < childrenNode.attributes.length; i++) {
                    if (childrenNode.attributes[i].data) {
                        currentNode.setAttribute(childrenNode.attributes[i].name, childrenNode.attributes[i].data);
                    } else if (childrenNode.attributes[i].data == false) {
                        currentNode.setAttribute(childrenNode.attributes[i].name, childrenNode.attributes[i].data);
                    }
                }
            }

            if (childrenNode && childrenNode.values && childrenNode.values.length >= 0) {
                for (var _i50 = 0; _i50 < childrenNode.values.length; _i50++) {
                    if (childrenNode.values[_i50].data) {
                        var a = doc.createCDATASection(childrenNode.values[_i50].data);

                        if (a) {
                            currentNode.appendChild(a);
                        }
                    }
                }
            }

            if (childrenNode.nodes && childrenNode.nodes.length > 0) {
                for (var _i51 = 0; _i51 < childrenNode.nodes.length; _i51++) {
                    createChildJson(currentNode, childrenNode.nodes[_i51], doc.createElement(childrenNode.nodes[_i51].ref), doc);
                }
            }

            node.appendChild(currentNode);
        }

        function _showXml() {
            var xml = jsonToXml();

            if (xml) {
                var xmlAsString = new XMLSerializer().serializeToString(xml);
                var a = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
                a = a.concat(xmlAsString);
                return vkbeautify.xml(a, 2);
            }
        } // autoValidate


        vm.autoValidate = function () {
            if (vm.nodes[0] && vm.nodes[0].attributes && vm.nodes[0].attributes.length > 0) {
                for (var i = 0; i < vm.nodes[0].attributes.length; i++) {
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
                for (var _i52 = 0; _i52 < vm.nodes[0].nodes.length; _i52++) {
                    var x = autoValidateRecursion(vm.nodes[0].nodes[_i52]);

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
                for (var i = 0; i < child.attributes.length; i++) {
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
                for (var _i53 = 0; _i53 < child.nodes.length; _i53++) {
                    var x = autoValidateRecursion(child.nodes[_i53]);

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
            });
        }; // validation for attributes


        vm.validateAttr = function (value, tag) {
            $scope.changeValidConfigStatus(false);

            if (tag.type === 'xs:NMTOKEN') {
                if (/\s/.test(value)) {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.spaceNotAllowed');
                    vm.errorName = {
                        e: tag.name
                    };

                    if (tag.data !== undefined) {
                        for (var key in tag) {
                            if (key == 'data') {
                                vm.autoValidate();
                            }
                        }
                    }
                } else if (value == '' && tag.use === 'required') {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                    vm.errorName = {
                        e: tag.name
                    };

                    if (tag.data !== undefined) {
                        for (var _key7 in tag) {
                            if (_key7 == 'data') {
                                delete tag[_key7];
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
                    vm.errorName = {
                        e: tag.name
                    };

                    if (tag.data !== undefined) {
                        for (var _key8 in tag) {
                            if (_key8 == 'data') {
                                delete tag[_key8];
                                vm.autoValidate();
                            }
                        }
                    }
                } else if (value == '' && tag.use === 'required') {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                    vm.errorName = {
                        e: tag.name
                    };

                    if (tag.data !== undefined) {
                        for (var _key9 in tag) {
                            if (_key9 == 'data') {
                                delete tag[_key9];
                                vm.autoValidate();
                            }
                        }
                    }
                } else {
                    vm.error = false;
                }
            } else if (tag.type === 'xs:string') {
                if (/[a-zA-Z0-9_/s/*]+.*$/.test(value)) {
                    vm.error = false;
                } else if (tag.use === 'required') {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                    vm.errorName = {
                        e: tag.name
                    };

                    if (tag.data !== undefined) {
                        for (var _key10 in tag) {
                            if (_key10 == 'data') {
                                delete tag[_key10];
                                vm.autoValidate();
                            }
                        }
                    }
                } else if (value.length > 0) {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.cannotAddBlankSpace');
                    vm.errorName = {
                        e: tag.name
                    };

                    if (tag.data !== undefined) {
                        for (var _key11 in tag) {
                            if (_key11 == 'data') {
                                delete tag[_key11];
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
                        vm.errorName = {
                            e: tag.name
                        };

                        if (tag.data !== undefined) {
                            for (var _key12 in tag) {
                                if (_key12 == 'data') {
                                    delete tag[_key12];
                                    vm.autoValidate();
                                }
                            }
                        }

                        vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                    } else if (/[a-zA-Z_*]/.test(value)) {
                        vm.error = true;
                        vm.errorName = {
                            e: tag.name
                        };

                        if (tag.data !== undefined) {
                            for (var _key13 in tag) {
                                if (_key13 == 'data') {
                                    delete tag[_key13];
                                    vm.autoValidate();
                                }
                            }
                        }

                        vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.onlyPositiveNumbers');
                    } else {
                        vm.error = true;
                        vm.errorName = {
                            e: tag.name
                        };

                        if (tag.data !== undefined) {
                            for (var _key14 in tag) {
                                if (_key14 == 'data') {
                                    delete tag[_key14];
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
                        tag = Object.assign(tag, {
                            data: value
                        });
                        vm.autoValidate();
                    } else if (tag.use === 'required' && value === '') {
                        vm.error = true;
                        vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                        vm.errorName = {
                            e: tag.name
                        };

                        if (tag.data !== undefined) {
                            for (var _key15 in tag) {
                                if (_key15 == 'data') {
                                    delete tag[_key15];
                                    vm.autoValidate();
                                }
                            }
                        }
                    } else if (/[a-zA-Z_*]/.test(value)) {
                        vm.error = true;
                        vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.onlyNumbers');
                        vm.errorName = {
                            e: tag.name
                        };

                        if (tag.data !== undefined) {
                            for (var _key16 in tag) {
                                if (_key16 == 'data') {
                                    delete tag[_key16];
                                    vm.autoValidate();
                                }
                            }
                        }
                    } else {
                        vm.error = true;
                        vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.onlyNumbers');
                        vm.errorName = {
                            e: tag.name
                        };

                        if (tag.data !== undefined) {
                            for (var _key17 in tag) {
                                if (_key17 == 'data') {
                                    delete tag[_key17];
                                    vm.autoValidate();
                                }
                            }
                        }
                    }
                }
            } else if (tag.type === 'xs:anyURI') {
                if (value) {
                    if (value == '' && tag.use === 'required') {
                        vm.error = true;
                        vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                        vm.errorName = {
                            e: tag.name
                        };

                        if (tag.data !== undefined) {
                            for (var _key18 in tag) {
                                if (_key18 == 'data') {
                                    delete tag[_key18];
                                    vm.autoValidate();
                                }
                            }
                        }
                    } else if (!EditorService.xsdAnyURIValidation(value)) {
                        vm.error = true;
                        vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.notValidUrl');
                        vm.errorName = {
                            e: tag.name
                        };

                        if (tag.data !== undefined) {
                            for (var _key19 in tag) {
                                if (_key19 == 'data') {
                                    delete tag[_key19];
                                    vm.autoValidate();
                                }
                            }
                        }
                    } else {
                        vm.error = false;
                        tag = Object.assign(tag, {
                            data: value
                        });
                        vm.autoValidate();
                    }
                }
            } else {
                tag = Object.assign(tag, {
                    data: value
                });
                vm.autoValidate();
            }
        };

        vm.checkDupProfileId = function (value, tag) {
            if (tag.name == 'profile_id' && vm.selectedNode.ref == 'Profile') {
                getParentNode(vm.selectedNode, vm.nodes[0]);

                if (vm.tempParentNode && vm.tempParentNode.nodes.length > 0) {
                    for (var i = 0; i < vm.tempParentNode.nodes.length; i++) {
                        if (vm.tempParentNode.nodes[i].attributes) {
                            for (var j = 0; j < vm.tempParentNode.nodes[i].attributes.length; j++) {
                                if (vm.tempParentNode.nodes[i].uuid != vm.selectedNode.uuid && vm.tempParentNode.nodes[i].attributes[j].id !== tag.id) {
                                    if (vm.tempParentNode.nodes[i].attributes[j].data === value) {
                                        vm.error = true;
                                        vm.errorName = {
                                            e: tag.name
                                        };
                                        vm.text = tag.name + ':' + gettextCatalog.getString('message.uniqueError');

                                        if (tag.data !== undefined) {
                                            for (var key in tag) {
                                                if (key == 'data') {
                                                    delete tag[key];
                                                }
                                            }
                                        }

                                        break;
                                    }
                                }
                            }
                        }

                        if (vm.error) {
                            break;
                        }
                    }

                    if (!vm.error) {
                        tag = Object.assign(tag, {
                            data: value
                        });
                        vm.autoValidate();
                    }
                }
            }
        };

        vm.submitData = function (value, tag) {
            if (tag.type === 'xs:NMTOKEN') {
                if (/\s/.test(value)) {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.spaceNotAllowed');
                    vm.errorName = {
                        e: tag.name
                    };

                    if (tag.data !== undefined) {
                        for (var key in tag) {
                            if (key == 'data') {
                                vm.autoValidate();
                            }
                        }
                    }
                } else if (value == '' && tag.use === 'required') {
                    vm.error = true;
                    vm.text = tag.name + ':' + gettextCatalog.getString('xml.message.requiredField');
                    vm.errorName = {
                        e: tag.name
                    };

                    if (tag.data !== undefined) {
                        for (var _key20 in tag) {
                            if (_key20 == 'data') {
                                delete tag[_key20];
                                vm.autoValidate();
                            }
                        }
                    }
                } else {
                    vm.error = false;
                    tag = Object.assign(tag, {
                        data: value
                    });
                    vm.autoValidate();
                }
            } else if (tag.type === 'xs:NCName') {
                if (/[\i:]|[:]/g.test(value)) {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.colonNotAllowed');
                    vm.errorName = {
                        e: tag.name
                    };

                    if (tag.data !== undefined) {
                        for (var _key21 in tag) {
                            if (_key21 == 'data') {
                                vm.autoValidate();
                            }
                        }
                    }
                } else if (value == '' && tag.use === 'required') {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                    vm.errorName = {
                        e: tag.name
                    };

                    if (tag.data !== undefined) {
                        for (var _key22 in tag) {
                            if (_key22 == 'data') {
                                delete tag[_key22];
                                vm.autoValidate();
                            }
                        }
                    }
                } else {
                    vm.error = false;
                    tag = Object.assign(tag, {
                        data: value
                    });
                    vm.autoValidate();
                }
            } else if (tag.type === 'xs:string') {
                if (/[.,/a-zA-Z0-9_\\s\*]+.*$/.test(value)) {
                    vm.error = false;
                    tag = Object.assign(tag, {
                        data: value
                    });
                    vm.autoValidate();
                } else if (tag.use === 'required') {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                    vm.errorName = {
                        e: tag.name
                    };

                    if (tag.data !== undefined) {
                        for (var _key23 in tag) {
                            if (_key23 == 'data') {
                                delete tag[_key23];
                                vm.autoValidate();
                            }
                        }
                    }
                } else if (value.length > 0) {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.cannotAddBlankSpace');
                    vm.errorName = {
                        e: tag.name
                    };

                    if (tag.data !== undefined) {
                        for (var _key24 in tag) {
                            if (_key24 == 'data') {
                                delete tag[_key24];
                                vm.autoValidate();
                            }
                        }
                    }
                } else {
                    vm.error = false;
                }
            } else if (tag.type === 'xs:positiveInteger') {
                if (/^([0-9])*$/.test(value)) {
                    vm.error = false;
                    tag = Object.assign(tag, {
                        data: value
                    });
                    vm.autoValidate();
                } else if (tag.use === 'required' && value === '') {
                    vm.error = true;
                    vm.errorName = {
                        e: tag.name
                    };
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');

                    if (tag.data !== undefined) {
                        for (var _key25 in tag) {
                            if (_key25 == 'data') {
                                delete tag[_key25];
                                vm.autoValidate();
                            }
                        }
                    }
                } else if (/[a-zA-Z_*]/.test(value)) {
                    vm.error = true;
                    vm.errorName = {
                        e: tag.name
                    };
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.onlyPositiveNumbers');

                    if (tag.data !== undefined) {
                        for (var _key26 in tag) {
                            if (_key26 == 'data') {
                                delete tag[_key26];
                                vm.autoValidate();
                            }
                        }
                    }
                } else if (/[0-9a-zA-Z_*]/.test(value)) {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.onlyPositiveNumbers');
                    vm.errorName = {
                        e: tag.name
                    };

                    if (tag.data !== undefined) {
                        for (var _key27 in tag) {
                            if (_key27 == 'data') {
                                delete tag[_key27];
                                vm.autoValidate();
                            }
                        }
                    }
                } else {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.cannotNegative');
                    vm.errorName = {
                        e: tag.name
                    };

                    if (tag.data !== undefined) {
                        for (var _key28 in tag) {
                            if (_key28 == 'data') {
                                delete tag[_key28];
                                vm.autoValidate();
                            }
                        }
                    }
                }
            } else if (tag.type === 'xs:integer') {
                if (/^(-){0,1}([0-9])*$/.test(value)) {
                    vm.error = false;
                    tag = Object.assign(tag, {
                        data: value
                    });
                    vm.autoValidate();
                } else if (tag.use === 'required' && value === '') {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                    vm.errorName = {
                        e: tag.name
                    };

                    if (tag.data !== undefined) {
                        for (var _key29 in tag) {
                            if (_key29 == 'data') {
                                delete tag[_key29];
                                vm.autoValidate();
                            }
                        }
                    }
                } else if (/[a-zA-Z_*]/.test(value)) {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.onlyNumbers');
                    vm.errorName = {
                        e: tag.name
                    };

                    if (tag.data !== undefined) {
                        for (var _key30 in tag) {
                            if (_key30 == 'data') {
                                delete tag[_key30];
                                vm.autoValidate();
                            }
                        }
                    }
                } else {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.onlyNumbers');
                    vm.errorName = {
                        e: tag.name
                    };

                    if (tag.data !== undefined) {
                        for (var _key31 in tag) {
                            if (_key31 == 'data') {
                                delete tag[_key31];
                                vm.autoValidate();
                            }
                        }
                    }
                }
            } else if (tag.type === 'xs:anyURI') {
                if (value) {
                    if (value == '' && tag.use === 'required') {
                        vm.error = true;
                        vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                        vm.errorName = {
                            e: tag.name
                        };

                        if (tag.data !== undefined) {
                            for (var _key32 in tag) {
                                if (_key32 == 'data') {
                                    delete tag[_key32];
                                    vm.autoValidate();
                                }
                            }
                        }
                    }

                    if (EditorService.xsdAnyURIValidation(value) === false) {
                        vm.error = true;
                        vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.notValidUrl');
                        vm.errorName = {
                            e: tag.name
                        };

                        if (tag.data !== undefined) {
                            for (var _key33 in tag) {
                                if (_key33 == 'data') {
                                    delete tag[_key33];
                                    vm.autoValidate();
                                }
                            }
                        }
                    } else {
                        vm.error = false;
                        tag = Object.assign(tag, {
                            data: value
                        });
                        vm.autoValidate();
                    }
                }
            } else {
                if (/[0-9]/.test(value)) {
                    vm.error = false;
                    tag = Object.assign(tag, {
                        data: value
                    });
                    vm.autoValidate();

                    if (tag.data !== undefined) {
                        for (var _key34 in tag) {
                            if (_key34 == 'data') {
                                delete tag[_key34];
                                vm.autoValidate();
                            }
                        }
                    }
                } else if (tag.use === 'required' && value === '') {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                    vm.errorName = {
                        e: tag.name
                    };

                    if (tag.data !== undefined) {
                        for (var _key35 in tag) {
                            if (_key35 == 'data') {
                                delete tag[_key35];
                                vm.autoValidate();
                            }
                        }
                    }
                } else if (tag.type === 'xs:boolean' && value === false) {
                    tag = Object.assign(tag, {
                        data: value
                    });
                    vm.autoValidate();
                } else if (value == '') {
                    tag = Object.assign(tag, {
                        data: tag.defalut
                    });
                    vm.autoValidate();
                }
            }
        }; // toaster pop toast


        function popToast(node) {
            var msg;

            if (node && node.name) {
                msg = 'Attribute "' + node.name + '" cannot be empty';
            } else {
                msg = 'cannot be empty';
            }

            toasty.error({
                title: 'Element : ' + node.parent,
                msg: msg,
                timeout: 20000
            });
        } // link gotokey


        vm.gotoKey = function (node) {
            if (node !== undefined) {
                if (node.refer === vm.nodes[0].ref) {
                    if (vm.nodes[0].key) {
                        for (var i = 0; i < vm.nodes[0].attributes.length; i++) {
                            if (vm.nodes[0].attributes[i].name === vm.nodes[0].key) {
                                if (node.data === vm.nodes[0].attributes[i].data) {
                                    vm.getData(vm.nodes[0]);
                                    vm.selectedNode = vm.nodes[0];
                                    vm.refElement = node;
                                }
                            }
                        }
                    } else {
                        for (var _i54 = 0; _i54 < vm.nodes[0].nodes.length; _i54++) {
                            vm.gotoKeyRecursion(node, vm.nodes[0].nodes[_i54]);
                        }
                    }
                } else {
                    for (var _i55 = 0; _i55 < vm.nodes[0].nodes.length; _i55++) {
                        vm.gotoKeyRecursion(node, vm.nodes[0].nodes[_i55]);
                    }
                }
            }

            vm.scrollTreeToGivenId(vm.selectedNode.uuid);
        };

        vm.getPos = function (node) {
            if (node && node.text) {
                $('[data-toggle="tooltip"]').tooltip({
                    trigger: 'hover focus manual',
                    html: true,
                    delay: {
                        'show': 500,
                        'hide': 200
                    }
                });
                var a = '#' + node.id;
                $(a).tooltip('show');
            }
        };

        function changeUuId(node, id) {
            node.uuid = id + vm.counting;
            vm.counting++;

            if (node && node.nodes && node.nodes.length > 0) {
                node.nodes.forEach(function (cNode) {
                    changeUuId(cNode, node.uuid);
                });
            }
        }

        function changeParentId(node, parentId) {
            node.parentId = parentId;

            if (node && node.nodes && node.nodes.length > 0) {
                node.nodes.forEach(function (cNode) {
                    changeParentId(cNode, node.uuid);
                });
            }
        }

        vm.checkChoice = function (node) {
            getNodeRulesData(node);

            if (vm.childNode && vm.childNode.length > 0) {
                var flg = true;

                for (var i = 0; i < vm.childNode.length; i++) {
                    if (vm.childNode[i] && vm.childNode[i].choice) {
                        if (node && node.nodes && node.nodes.length > 0) {
                            for (var j = 0; j < node.nodes.length; j++) {
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
            if (node.values && node.values[0].base === 'xs:string' && node.values[0] && node.values[0].values && node.values[0].values.length > 0 && node.values[0].default === undefined) {
                node.values[0].default = node.values[0].values[0].value;
                node.values[0].data = node.values[0].values[0].value;
            } else if (node.values && node.values[0].base === 'xs:boolean' && node.values[0].default === undefined) {
                node.values[0].default = true;
                node.values[0].data = true;
            }
        };

        vm.getCustomCss = function (node, parentNode) {
            var count = 0;

            if (vm.choice) {
                if (node.maxOccurs === 'unbounded') {
                    return '';
                } else if (node.maxOccurs !== 'unbounded' && node.maxOccurs !== undefined) {
                    if (parentNode.nodes && parentNode.nodes.length > 0) {
                        for (var i = 0; i < parentNode.nodes.length; i++) {
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
                        for (var _i56 = 0; _i56 < parentNode.nodes.length; _i56++) {
                            if (node.ref === parentNode.nodes[_i56].ref) {
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
                    for (var _i57 = 0; _i57 < parentNode.nodes.length; _i57++) {
                        if (node.ref === parentNode.nodes[_i57].ref) {
                            count++;
                        }
                    }

                    if (node.maxOccurs == count) {
                        return 'disabled disable-link';
                    }
                }
            } else if (node.maxOccurs === undefined) {
                if (parentNode.nodes && parentNode.nodes.length > 0) {
                    for (var _i58 = 0; _i58 < parentNode.nodes.length; _i58++) {
                        if (node.ref === parentNode.nodes[_i58].ref) {
                            return 'disabled disable-link';
                        }
                    }
                }
            }
        }; // attibutes popover


        vm.tooltip = function (node) {
            $('[data-toggle="tooltip-data"]').tooltip({
                trigger: 'hover focus manual',
                html: true,
                delay: {
                    'show': 300,
                    'hide': 300
                }
            });
            vm.tooltipAttrData = '';

            if (node && node.attributes && node.attributes.length > 0) {
                for (var i = 0; i < node.attributes.length; i++) {
                    if (node.attributes[i].data) {
                        if (node.attributes[i].name !== 'password') {
                            var temp = '<tr><td class="tTable">';
                            temp = temp + node.attributes[i].name;
                            temp = temp + '</td><td class="tTable">';
                            temp = temp + node.attributes[i].data;
                            temp = temp + '</td></tr>';
                            vm.tooltipAttrData = vm.tooltipAttrData + temp;
                        } else {
                            var _temp = '<tr><td>';
                            _temp = _temp + node.attributes[i].name;
                            _temp = _temp + '</td><td>';
                            _temp = _temp + vm.passwordLabel(node.attributes[i].data);
                            _temp = _temp + '</td></tr>';
                            vm.tooltipAttrData = vm.tooltipAttrData + _temp;
                        }
                    }
                }

                if (vm.tooltipAttrData !== '') {
                    vm.tooltipAttrData = '<table class="tTable">' + vm.tooltipAttrData + '</table>';
                }
            }

            if (node && node.values && node.values.length > 0) {
                for (var _i59 = 0; _i59 < node.values.length; _i59++) {
                    if (node.values[_i59].data) {
                        if (node.ref !== 'password') {
                            var _temp2 = '<div>';
                            _temp2 = _temp2 + node.values[_i59].data;
                            _temp2 = _temp2 + '</div>';
                            vm.tooltipAttrData = vm.tooltipAttrData + _temp2;
                        } else {
                            var _temp3 = '<div>';
                            _temp3 = _temp3 + vm.passwordLabel(node.values[_i59].data);
                            _temp3 = _temp3 + '</div>';
                            vm.tooltipAttrData = vm.tooltipAttrData + _temp3;
                        }
                    }
                }
            }

            if (vm.tooltipAttrData != '') {
                var x = $.parseHTML(vm.tooltipAttrData);
                var htmlTag = document.createElement('div');

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
                        for (var i = 0; i < child.attributes.length; i++) {
                            if (child.attributes[i].name === child.key) {
                                if (node.data === child.attributes[i].data) {
                                    vm.getData(child);
                                    vm.selectedNode = child;
                                    vm.refElement = node;
                                }
                            }
                        }
                    } else {
                        for (var _i60 = 0; _i60 < child.nodes.length; _i60++) {
                            vm.gotoKeyRecursion(node, child.nodes[_i60]);
                        }
                    }
                } else {
                    for (var _i61 = 0; _i61 < child.nodes.length; _i61++) {
                        vm.gotoKeyRecursion(node, child.nodes[_i61]);
                    }
                }
            }
        };

        vm.gotoKeyref = function (node) {
            if (node) {
                if (node.refElement === vm.nodes[0].ref) {
                    if (vm.nodes[0].keyref) {
                        for (var i = 0; i < vm.nodes[0].attributes.length; i++) {
                            if (vm.nodes[0].attributes[i].name === vm.nodes[0].keyref) {
                                if (node.data === vm.nodes[0].attributes[i].data) {
                                    vm.getData(vm.nodes[0]);
                                    vm.selectedNode = vm.nodes[0];
                                }
                            }
                        }
                    } else {
                        for (var _i62 = 0; _i62 < vm.nodes[0].nodes.length; _i62++) {
                            vm.gotoKeyrefRecursion(node, vm.nodes[0].nodes[_i62]);
                        }
                    }
                } else if (vm.refElement && vm.refElement.parent === vm.nodes[0].ref) {
                    if (vm.nodes[0].keyref) {
                        for (var _i63 = 0; _i63 < vm.nodes[0].attributes.length; _i63++) {
                            if (vm.nodes[0].attributes[_i63].name === vm.nodes[0].keyref) {
                                if (node.data === vm.nodes[0].attributes[_i63].data) {
                                    vm.getData(vm.nodes[0]);
                                    vm.selectedNode = vm.nodes[0];
                                }
                            }
                        }
                    } else {
                        for (var _i64 = 0; _i64 < vm.nodes[0].nodes.length; _i64++) {
                            vm.gotoKeyrefRecursion(node, vm.nodes[0].nodes[_i64]);
                        }
                    }
                } else {
                    for (var _i65 = 0; _i65 < vm.nodes[0].nodes.length; _i65++) {
                        vm.gotoKeyrefRecursion(node, vm.nodes[0].nodes[_i65]);
                    }
                }

                vm.scrollTreeToGivenId(vm.selectedNode.uuid);
            }
        };

        vm.gotoKeyrefRecursion = function (node, child) {
            if (node !== undefined) {
                if (node.refElement === child.ref) {
                    if (child.keyref) {
                        for (var i = 0; i < child.attributes.length; i++) {
                            if (child.attributes[i].name === child.keyref) {
                                if (node.data === child.attributes[i].data) {
                                    vm.selectedNode = child;
                                    vm.getData(child);
                                }
                            }
                        }
                    } else {
                        for (var _i66 = 0; _i66 < child.nodes.length; _i66++) {
                            vm.gotoKeyrefRecursion(node, child.nodes[_i66]);
                        }
                    }
                } else if (vm.refElement && vm.refElement.parent === child.ref) {
                    if (child.keyref) {
                        for (var _i67 = 0; _i67 < child.attributes.length; _i67++) {
                            if (child.attributes[_i67].name === child.keyref) {
                                if (node.data === child.attributes[_i67].data) {
                                    vm.selectedNode = child;
                                    vm.getData(child);
                                }
                            }
                        }
                    } else {
                        for (var _i68 = 0; _i68 < child.nodes.length; _i68++) {
                            vm.gotoKeyrefRecursion(node, child.nodes[_i68]);
                        }
                    }
                } else {
                    for (var _i69 = 0; _i69 < child.nodes.length; _i69++) {
                        vm.gotoKeyrefRecursion(node, child.nodes[_i69]);
                    }
                }
            }
        };

        vm.expandParentNodesOfSelectedNode = function (node) {
            if (node.parent !== '#') {
                getParentNode(node, vm.nodes[0]);

                if (vm.tempParentNode.parent !== '#') {
                    vm.expandParentNodesOfSelectedNode(vm.tempParentNode);
                }
            }
        };

        function getParentNode(node, list) {
            if (node.parentId === list.uuid && list.parent == '#') {
                list.expanded = true;
                vm.tempParentNode = list;
            } else {
                if (list.nodes) {
                    for (var i = 0; i < list.nodes.length; i++) {
                        if (node.parentId === list.nodes[i].uuid) {
                            list.nodes[i].expanded = true;
                            vm.tempParentNode = list.nodes[i];
                        } else {
                            getParentNode(node, list.nodes[i]);
                        }
                    }
                }
            }
        } // validate xml


        function validate() {
            vm.autoValidate();

            if (_.isEmpty(vm.nonValidattribute)) {
                validateSer();
                hideButtons();

                if (vm.XSDState && vm.XSDState.message && vm.XSDState.message.code && vm.XSDState.message.code == 'XMLEDITOR-101') {
                    vm.isDeploy = true;
                }

                hideButtons();
            } else {
                popToast(vm.nonValidattribute);

                if (vm.nonValidattribute.base) {
                    vm.error = true;
                    vm.errorName = {
                        e: vm.nonValidattribute.parent
                    };
                    vm.text = gettextCatalog.getString('xml.message.requiredField');
                }

                if (vm.nonValidattribute.name) {
                    vm.validateAttr('', vm.nonValidattribute);
                }

                vm.gotoErrorLocation();
            }
        }

        function validateSer() {
            vm._xml = _showXml();
            var obj = {
                jobschedulerId: vm.schedulerIds.selected,
                objectType: vm.objectType,
                configuration: vm._xml
            };

            if (vm.objectType === 'OTHER') {
                obj.schemaIdentifier = vm.schemaIdentifier;
            }

            EditorService.validateXML(obj).then(function (res) {
                if (res.validationError) {
                    showError(res.validationError);
                } else {
                    $scope.changeValidConfigStatus(true);
                }
            }, function (error) {
                $scope.changeValidConfigStatus(false);

                if (error.data && error.data.error) {
                    toasty.error({
                        msg: error.data.error.message,
                        timeout: 20000
                    });
                }
            });
        }

        function showError(error) {
            var iNode = {
                eleName: error.elementName,
                elePos: error.elementPosition.split('-')
            };
            gotoInfectedElement(iNode, vm.nodes);
            $scope.changeValidConfigStatus(false);
            vm.getIndividualData(vm.selectedNode, true);
            toasty.error({
                msg: error.message,
                timeout: 20000
            });
        }

        function gotoInfectedElement(node, nodes) {
            for (var j = 0; j < nodes.length; j++) {
                if (node.elePos[0] == j + 1) {
                    nodes[j].expanded = true;
                    node.elePos.splice(0, 1);

                    if (node.elePos.length > 0) {
                        gotoInfectedElement(node, nodes[j].nodes);
                    } else {
                        nodes[j].expanded = true;
                        vm.selectedNode = nodes[j];
                    }

                    break;
                }
            }
        }

        vm.importXSD = function () {
            vm.importXSDFile = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/configuration/views/import-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                if (!ok(vm.uploadData)) {
                    if (vm.reassignSchema) {
                        vm.changeSchema();
                    } else {
                        vm.othersSubmit();
                    }

                    vm.importXSDFile = false;
                }
            }, function () {
                toasty.clear();
            });
        }; // import xml model


        function importXML() {
            if (localStorage.getItem('schemas')) {
                vm.otherSchema = localStorage.getItem('schemas').split(',');
            }

            if (vm.objectType === 'OTHER') {
                vm.importObj = {
                    assignXsd: vm.schemaIdentifier
                };
            } else {
                vm.importObj = {
                    assignXsd: vm.objectType
                };
            }

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/configuration/views/import-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm.schemaIdentifier = vm.importObj.assignXsd;

                if (vm.importObj.assignXsd) {
                    if (!ok(vm.uploadData)) {
                        vm.copyItem = undefined;
                        vm.selectedXsd.xsd = vm.importObj.assignXsd;
                        vm.isLoading = true;

                        if (vm.objectType === 'OTHER') {
                            if (vm.tabsArray.length === 0) {
                                var _tab = angular.copy({
                                    id: -1,
                                    name: 'edit1',
                                    schemaIdentifier: vm.schemaIdentifier
                                });

                                vm.tabsArray.push(_tab);
                                EditorService.readXML({
                                    jobschedulerId: vm.schedulerIds.selected,
                                    objectType: vm.objectType,
                                    id: _tab.id
                                }).then(function (res) {
                                    vm.activeTab = vm.tabsArray[0];
                                    getXsdSchema();
                                }, function (err) {
                                    toasty.error({
                                        msg: err.data.error.message,
                                        timeout: 20000
                                    });
                                    vm.isLoading = false;
                                });
                            } else {
                                getXsdSchema();
                            }
                        } else {
                            xmlToJsonService();
                        }
                    } else {
                        openXMLDialog(vm.uploadData);
                        vm.importObj = {};

                        if (uploader.queue && uploader.queue.length > 0) {
                            uploader.queue[0].remove();
                        }
                    }
                }
            }, function () {
                toasty.clear();
            });
        }

        function getXsdSchema() {
            var obj = {
                jobschedulerId: vm.schedulerIds.selected,
                objectType: vm.objectType,
                uri: vm.schemaIdentifier
            };
            EditorService.assignSchema(obj).then(function (res) {
                if (res.schema) {
                    vm.path = res.schema;
                    vm.schemaIdentifier = res.schemaIdentifier;
                    xmlToJsonService();
                }
            }, function (err) {
                toasty.error({
                    msg: err.data.error.message,
                    timeout: 20000
                });
                vm.isLoading = false;
            });
        }

        function xmlToJsonService() {
            var obj = {
                jobschedulerId: vm.schedulerIds.selected,
                objectType: vm.objectType,
                configuration: vm.uploadData
            };

            if (vm.objectType === 'OTHER') {
                obj.schemaIdentifier = vm.schemaIdentifier;
            }

            EditorService.xmlToJson(obj).then(function (res) {
                $scope.changeValidConfigStatus(false);
                var a = [];
                var arr = JSON.parse(res.configurationJson);
                a.push(arr);
                vm.counting = arr.lastUuid;
                vm.doc = new DOMParser().parseFromString(vm.path, 'application/xml');
                vm.nodes = a;
                vm.getIndividualData(vm.nodes[0]);
                vm.selectedNode = vm.nodes[0];
                vm.isLoading = false;
                vm.submitXsd = true;
                vm.isDeploy = true;
                vm.XSDState = {};
                vm.prevXML = '';
                storeXML();

                if (vm.objectType === 'OTHER') {
                    vm.activeTab.schemaIdentifier = vm.schemaIdentifier;
                }

                hideButtons();

                if (uploader.queue && uploader.queue.length > 0) {
                    uploader.queue[0].remove();
                }
            }, function () {
                vm.importObj = {};

                if (uploader.queue && uploader.queue.length > 0) {
                    uploader.queue[0].remove();
                }

                vm.isLoading = false;
            });
        }

        function openXMLDialog(data) {
            vm.editorOptions.readOnly = false;
            vm.objectXml = {};
            vm.objectXml.isXMLEditor = true;
            vm.objectXml.xml = data;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/configuration/views/object-xml-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {}, function () {
                vm.objectXml = {};
                toasty.clear();
            });
        } // open new Conformation model


        function newFile() {
            vm.ckEditor = null;
            vm.delete = false;

            if (vm.submitXsd && vm.objectType !== 'OTHER') {
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/configuration/views/confirmation-dialog.html',
                    controller: 'DialogCtrl1',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function (res) {
                    vm.copyItem = undefined;
                    save();
                    vm.nodes = [];
                    newConf();
                }, function () {
                    vm.copyItem = undefined;
                    vm.nodes = [];
                    vm.selectedNode = [];
                    newConf();
                });
            } else if (!vm.submitXsd && vm.objectType !== 'OTHER') {
                vm.copyItem = undefined;
                vm.nodes = [];
                vm.selectedNode = [];
                newConf();
            } else {
                if (vm.objectType === 'OTHER') {
                    vm.nodes = [];
                    vm.selectedNode = [];
                    vm.selectedXsd.xsd = undefined;
                    vm.copyItem = undefined;
                    createNewTab();
                } else {
                    newConf();
                }
            }
        }

        function createNewTab() {
            var _tab;

            if (vm.tabsArray.length === 0) {
                _tab = angular.copy({
                    id: -1,
                    name: 'edit1'
                });
            } else {
                var tempName;
                _tab = angular.copy(vm.tabsArray[vm.tabsArray.length - 1]);
                _tab.id = Math.sign(angular.copy(_tab.id - 1)) === 1 ? -1 : angular.copy(_tab.id - 1);

                for (var i = 0; i < vm.tabsArray.length; i++) {
                    if (vm.tabsArray[i].name) {
                        var _arr = vm.tabsArray[i].name.match(/[a-zA-Z]+/g);

                        if (_arr && _arr.length > 0 && _arr[0] === 'edit') {
                            if (!tempName) {
                                tempName = vm.tabsArray[i].name;
                            }

                            if (tempName && parseInt(vm.tabsArray[i].name.match(/\d+/g)[0]) > parseInt(tempName.match(/\d+/g)[0])) {
                                tempName = vm.tabsArray[i].name;
                            }
                        }
                    }
                }

                if (tempName) {
                    _tab.name = angular.copy('edit' + (parseInt(tempName.match(/\d+/g)[0]) + 1));
                } else {
                    _tab.name = 'edit1';
                }
            }

            _tab.schemaIdentifier = null;
            vm.tabsArray.push(_tab);
            vm.reassignSchema = false;
            vm.activeTab = _tab;
            vm._activeTab.isVisible = true;
            readOthersXSD(_tab.id);
        }

        vm.changeTab = function (data, isStore) {
            if (!data.schemaIdentifier) {
                vm._activeTab.isVisible = true;
            } else {
                vm._activeTab.isVisible = false;
            }

            if (vm.activeTab.id !== data.id) {
                if (vm.activeTab.id < 0 || isStore) {
                    vm.activeTab = data;
                    readOthersXSD(data.id);
                } else {
                    storeXML(function () {
                        vm.activeTab = data;
                        readOthersXSD(data.id);
                    });
                }
            }

            $scope.changeValidConfigStatus(false);
        };

        vm.cancelRename = function (data) {
            delete data['rename'];
            data.name = angular.copy(vm.oldName);
            vm.oldName = null;
        };

        vm.renameTab = function (tab) {
            if (vm.schemaIdentifier) {
                tab.rename = true;
                vm.oldName = angular.copy(tab.name);
                var wt = $('#' + tab.id).width();
                setTimeout(function () {
                    var dom = $('#rename-field');
                    dom.width(wt);
                    dom.focus();

                    try {
                        dom.select();
                    } catch (e) {}
                }, 0);
            }
        };

        vm.renameOnEnter = function ($event, data) {
            var key = $event.keyCode || $event.which;

            if (key === 13) {
                delete data['rename'];

                if (data.name && data.name !== vm.oldName) {
                    renameFile(data);
                } else {
                    data.name = angular.copy(vm.oldName);
                    vm.oldName = null;
                }
            }
        };

        vm.renameDone = function (data) {
            if (data.name && data.name !== vm.oldName) {
                renameFile(data);
            } else {
                data.name = angular.copy(vm.oldName);
                vm.oldName = null;
            }

            delete data['rename'];
        };

        function renameFile(data) {
            EditorService.renameXML({
                jobschedulerId: vm.schedulerIds.selected,
                objectType: vm.objectType,
                id: data.id,
                name: data.name,
                schemaIdentifier: vm.schemaIdentifier
            }).then(function (res) {
                vm.oldName = null;
            }, function (err) {
                data.name = vm.oldName;
                toasty.error({
                    msg: err.data.error.message,
                    timeout: 10000
                });
            });
        }

        function readOthersXSD(id) {
            vm.nodes = [];
            vm.selectedNode = [];
            EditorService.readXML({
                jobschedulerId: vm.schedulerIds.selected,
                objectType: vm.objectType,
                id: id
            }).then(function (res) {
                if (!res.configuration) {
                    vm.showSelectSchema = true;
                    vm.submitXsd = false;
                    vm.schemaIdentifier = undefined;
                    vm.otherSchema = res.schemas;
                    localStorage.setItem('schemas', vm.otherSchema);
                } else {
                    vm.showSelectSchema = false;

                    if (!ok(res.configuration.configuration)) {
                        vm.doc = new DOMParser().parseFromString(res.configuration.schema, 'application/xml');
                        vm.path = res.configuration.schema;
                        vm.schemaIdentifier = res.configuration.schemaIdentifier;
                        vm.submitXsd = true;
                        vm.prevXML = removeComment(res.configuration.configuration);

                        if (res.configuration.configurationJson) {
                            var _tempArrToExpand = [];
                            var a;

                            try {
                                a = JSON.parse(res.configuration.configurationJson);
                            } catch (error) {
                                vm.isLoading = false;
                                vm.submitXsd = false;
                            }

                            if (!res.configuration.recreateJson) {
                                vm.counting = angular.copy(a.nodesCount);
                                vm.nodes = a.node;
                            } else {
                                vm.counting = a.lastUuid;
                                vm.nodes = [a];
                                vm.getIndividualData(vm.nodes[0]);
                                handleNodeToExpandAtOnce(vm.nodes, null, _tempArrToExpand);
                            }

                            vm.isLoading = false;
                            vm.selectedNode = vm.nodes[0];
                            res.configuration.state.modified = res.configuration.modified;
                            vm.XSDState = res.configuration.state;
                            storeXML();

                            if (_tempArrToExpand && _tempArrToExpand.length > 0) {
                                setTimeout(function () {
                                    for (var i = 0; i < _tempArrToExpand.length; i++) {
                                        _tempArrToExpand[i].expanded = true;
                                    }
                                }, 10);
                            }

                            hideButtons();
                        } else {
                            vm.nodes = [];
                            vm.isLoading = true;
                            loadTree(res.configuration.schema, true);
                            setTimeout(function () {
                                createJSONFromXML(res.configuration.configuration);
                            }, 600);
                        }

                        hideButtons();

                        if (vm.objectType == 'OTHER') {
                            vm._activeTab.isVisible = false;
                        }
                    } else {
                        openXMLDialog(res.configuration.configuration);
                    }
                }
            }, function (err) {
                vm.submitXsd = false;
                vm.isLoading = false;
                vm.XSDState = '';
                vm.error = true;
                toasty.error({
                    msg: err.data.error.message,
                    timeout: 20000
                });
                hideButtons();
            });
        }

        function newConf() {
            var obj = {
                jobschedulerId: vm.schedulerIds.selected,
                objectType: vm.objectType
            };

            if (vm._xml) {
                obj.configuration = vm._xml;
            }

            EditorService.readXML(obj).then(function (res) {
                vm.schemaIdentifier = res.schemaIdentifier;

                if (res.schema) {
                    vm.path = res.schema;
                    loadTree(res.schema, false);
                    vm.submitXsd = true;
                    vm.isDeploy = false;
                    vm.XSDState = res.state;
                    vm.XSDState.modified = res.modified;
                    vm.prevXML = '';
                    storeXML();
                    hideButtons();
                }
            }, function (err) {
                vm.submitXsd = false;
                vm.isLoading = false;
                vm.XSDState = '';
                vm.error = true;
                toasty.error({
                    msg: err.data.error.message,
                    timeout: 20000
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
                    objectType: vm.objectType,
                    configuration: vm._xml,
                    configurationJson: JSON.stringify({
                        nodesCount: vm.counting,
                        node: vm.nodes
                    })
                }).then(function (res) {
                    if (res.validationError) {
                        showError(res.validationError);
                    } else {
                        vm.prevXML = vm._xml;
                        vm.isDeploy = true;
                        vm.XSDState = Object.assign({}, {
                            message: res.message
                        });
                        $scope.changeValidConfigStatus(true);

                        if (res.deployed) {
                            vm.XSDState.modified = res.deployed;
                        }
                    }

                    hideButtons();
                }, function (error) {
                    toasty.error({
                        msg: error.data.error.message,
                        timeout: 20000
                    });
                });
            } else {
                vm.gotoErrorLocation();
                popToast(vm.nonValidattribute);

                if (vm.nonValidattribute.name) {
                    vm.validateAttr('', vm.nonValidattribute);
                }
            }
        } // save xml


        function save() {
            var xml = _showXml();

            var name;

            if (vm.objectType === 'OTHER') {
                name = vm.activeTab.name + '.xml';
            } else {
                name = vm.nodes[0].ref + '.xml';
            }

            var fileType = 'application/xml';
            var blob = new Blob([xml], {
                type: fileType
            });
            saveAs(blob, name);
        } // create Xml from Json


        function showXml() {
            vm.editorOptions.readOnly = false;
            vm.objectXml = {};
            vm.objectXml.isXMLEditor = true;
            vm.objectXml.xml = _showXml();
            vm.isEditable = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/configuration/views/object-xml-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm.copyItem = undefined;
            }, function () {
                vm.objectXml = {};
                toasty.clear();
            });
        }

        vm.submitXML = function (cb) {
            var data = vm._editor.getValue();

            var obj = {
                jobschedulerId: vm.schedulerIds.selected,
                objectType: vm.objectType,
                configuration: data
            };

            if (vm.objectType == 'OTHER') {
                obj.id = vm.activeTab.id;
                obj.schemaIdentifier = vm.schemaIdentifier;
                obj.name = vm.activeTab.name;
            }

            EditorService.applySchema(obj).then(function (res) {
                if (res.configurationJson) {
                    var a = [];
                    var arr = JSON.parse(res.configurationJson);
                    a.push(arr);
                    vm.counting = arr.lastUuid;
                    vm.doc = new DOMParser().parseFromString(vm.path, 'application/xml');
                    vm.nodes = a;
                    vm.submitXsd = true;
                    var x = {
                        state: {
                            message: res.message
                        }
                    };
                    vm.XSDState = x.state;
                    vm.prevXML = '';
                    vm.selectedNode = vm.nodes[0];
                    vm.getIndividualData(vm.selectedNode);
                    vm.getData(vm.selectedNode);
                    hideButtons();
                    cb();
                } else if (res.validationError) {
                    highlightLineNo(res.validationError.line);
                    toasty.error({
                        msg: res.validationError.message,
                        timeout: 20000
                    });
                }
            }, function (err) {
                vm.error = true;
                toasty.error({
                    msg: err.data.error.message,
                    timeout: 20000
                });
            });
        };

        vm.validateXML = function () {
            var obj = {
                jobschedulerId: vm.schedulerIds.selected,
                objectType: vm.objectType,
                configuration: vm._editor.getValue()
            };

            if (vm.objectType === 'OTHER') {
                obj.schemaIdentifier = vm.activeTab.schemaIdentifier;
            }

            EditorService.validateXML(obj).then(function (res) {
                if (res.validationError) {
                    highlightLineNo(res.validationError.line);
                    toasty.error({
                        msg: res.validationError.message,
                        timeout: 20000
                    });
                } else {
                    toasty.clear();
                    toasty.success({
                        msg: 'xml.message.validateSuccessfully'
                    });
                }
            }, function (error) {
                if (error.data && error.data.error) {
                    toasty.error({
                        msg: error.data.error.message,
                        timeout: 20000
                    });
                }
            });
        };

        function initEditor(data) {
            if (vm.ckEditor) {
                vm.ckEditor.destroy();
            }

            try {
                CKEDITOR.replace('ckEditorId', {
                    plugins: 'tableselection,blockquote,contextmenu,wysiwygarea,link,list,table,tab,tabletools,undo,htmlwriter,toolbar,sourcearea,specialchar,indentlist,enterkey,basicstyles,clipboard,stylescombo,format',
                    toolbar: [{
                        name: 'document',
                        items: ['Source']
                    }, {
                        name: 'clipboard',
                        items: ['Cut', 'Copy', 'Paste', 'Undo', 'Redo']
                    }, {
                        name: 'editing',
                        items: ['Find', 'Replace', '-']
                    }, {
                        name: 'basicstyles',
                        items: ['Bold', 'Italic', 'Underline']
                    }, {
                        name: 'paragraph',
                        items: ['NumberedList', 'BulletedList', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']
                    }, {
                        name: 'insert',
                        items: ['Table']
                    }, {
                        name: 'styles',
                        items: ['Styles', 'Format']
                    }, {
                        name: 'links',
                        items: ['Link', 'Unlink']
                    }, {
                        name: 'styles',
                        items: ['Font', 'FontSize']
                    }],
                    allowedContent: true,
                    bodyClass: vm.userPreferences.theme !== 'light' && vm.userPreferences.theme !== 'lighter' || !vm.userPreferences.theme ? 'white_text' : 'dark_text'
                });
                vm.ckEditor = CKEDITOR.instances['ckEditorId'];
            } catch (e) {
                console.error(e);
            }

            if (vm.ckEditor) {
                if (data.data) {
                    vm.ckEditor.setData(data.data);
                } else {
                    vm.ckEditor.setData('');
                }

                vm.ckEditor.on('change', function () {
                    vm.myContent = vm.ckEditor.getData();
                    parseEditorText(vm.myContent, vm.selectedNode);
                });
            }
        }

        vm.parseCkEditorValue = function (data) {
            parseEditorText(data, vm.selectedNode);
        };

        function parseEditorText(evn, nodes) {
            if (evn.match(/<[^>]+>/gm)) {
                var x = evn.replace(/<[^>]+>/gm, '');

                if (x !== '&nbsp;') {
                    x = x.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<");
                    nodes.values[0] = Object.assign(nodes.values[0], {
                        data: x
                    });
                    vm.myContent = nodes.values[0].data;
                    vm.error = false;
                } else {
                    delete nodes.values[0].data;
                }
            } else {
                delete nodes.values[0].data;
            }
        } //delete config


        function deleteConf() {
            vm.delete = true;
            vm.deleteAll = false;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/configuration/views/confirmation-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function (res) {
                del();
                vm.delete = false;
            }, function () {
                vm.delete = false;
            });
        } //delete all config


        function deleteAll() {
            vm.deleteAll = true;
            vm.delete = false;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/configuration/views/confirmation-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function (res) {
                var obj = {
                    jobschedulerId: vm.schedulerIds.selected,
                    objectTypes: ["OTHER"]
                };
                EditorService.deleteAllXML(obj).then(function (res) {
                    vm.tabsArray = [];
                    vm.nodes = [];
                    vm.selectedNode = [];
                    vm.submitXsd = false;
                    vm.isLoading = false;
                    vm.XSDState = '';
                    vm.schemaIdentifier = '';
                    hideButtons();
                });
                vm.deleteAll = false;
            }, function () {
                vm.deleteAll = false;
            });
        }

        function del() {
            if (vm.objectType == 'OTHER' && vm.activeTab.id < 0) {
                for (var i = 0; i < vm.tabsArray.length; i++) {
                    if (vm.tabsArray[i].id === vm.activeTab.id) {
                        vm.tabsArray.splice(i, 1);
                        break;
                    }
                }

                if (vm.tabsArray.length > 0) {
                    vm.changeTab(vm.tabsArray[vm.tabsArray.length - 1], true);
                }

                return;
            }

            var obj = {
                jobschedulerId: vm.schedulerIds.selected,
                objectType: vm.objectType
            };

            if (vm.objectType == 'OTHER') {
                obj.id = vm.activeTab.id;
            }

            EditorService.deleteXML(obj).then(function (res) {
                if (res.configuration) {
                    if (!ok(res.configuration)) {
                        var obj1 = {
                            jobschedulerId: vm.schedulerIds.selected,
                            objectType: vm.objectType,
                            configuration: res.configuration
                        };

                        if (vm.objectType === 'OTHER') {
                            obj1.schemaIdentifier = vm.schemaIdentifier;
                        }

                        EditorService.xmlToJson(obj1).then(function (result) {
                            vm.isLoading = true;
                            var a = [];
                            var arr = JSON.parse(result.configurationJson);
                            a.push(arr);
                            vm.counting = arr.lastUuid;
                            vm.doc = new DOMParser().parseFromString(vm.path, 'application/xml');
                            vm.nodes = a;
                            vm.getIndividualData(vm.nodes[0]);
                            vm.isLoading = false;
                            vm.selectedNode = vm.nodes[0];
                            vm.XSDState = res.state;
                            vm.submitXsd = true;
                            vm.isDeploy = res.state.deployed;

                            if (res.state.deployed) {
                                $scope.changeValidConfigStatus(true);
                            }

                            vm.prevXML = removeComment(res.configuration);
                            vm.copyItem = undefined;
                            hideButtons();
                        }, function (err) {
                            vm.isLoading = false;
                            vm.error = true;
                            toasty.error({
                                msg: err.data.error.message,
                                timeout: 20000
                            });
                        });
                    } else {
                        vm.nodes = [];
                        vm.submitXsd = false;
                        vm.isLoading = false;
                        vm.XSDState = res.state;

                        if (vm.objectType === 'OTHER') {
                            vm.tabsArray = vm.tabsArray.filter(function (x) {
                                return x.id != vm.activeTab.id;
                            });

                            if (vm.tabsArray.length > 0) {
                                if (vm.activeTab.schemaIdentifier != undefined) {
                                    vm.selectedXsd.xsd = true;
                                }

                                vm.changeTab(vm.tabsArray[0], true);
                            }
                        }

                        openXMLDialog();
                        hideButtons();
                    }
                } else {
                    vm.nodes = [];
                    vm.submitXsd = false;
                    vm.isLoading = false;
                    vm.XSDState = res.state;

                    if (vm.objectType === 'OTHER') {
                        vm.schemaIdentifier = undefined;
                        vm.tabsArray = vm.tabsArray.filter(function (x) {
                            return x.id != vm.activeTab.id;
                        });

                        if (vm.tabsArray.length > 0) {
                            vm.changeTab(vm.tabsArray[0], true);
                        }
                    }

                    hideButtons();
                }
            }, function (error) {
                toasty.error({
                    msg: error.data.error.message,
                    timeout: 20000
                });
            });
        }

        function recursiveGetAllChilds(list) {
            for (var child in list) {
                list[child].nodes = [];
                vm.checkChildNode(list[child], list[child]);
                recursiveGetAllChilds(list[child].nodes);
            }
        }

        function getAllChilds(list) {
            for (var child in list) {
                list[child].nodes = [];
                vm.checkChildNode(list[child], list[child]);
            }
        } // Show all Child Nodes and search functionalities.


        vm.showAllChildNode = function (node) {
            vm.isLoadingChild = true;
            vm._nodes = [];
            vm._selectedNode = node.text;
            vm._node = {
                ref: node.ref,
                parent: node.parent
            };
            var obj = {
                ref: node.ref,
                parent: node.parent,
                nodes: [],
                expanded: true
            };
            vm.checkChildNode(obj, obj);

            vm._nodes.push(obj);

            vm.counter = 0;
            getAllChilds(obj.nodes);
            $uibModal.open({
                templateUrl: 'modules/configuration/views/show-childs-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            setTimeout(function () {
                for (var child in obj.nodes) {
                    obj.nodes[child].nodes = [];
                    vm.checkChildNode(obj.nodes[child], obj.nodes[child]);
                    recursiveGetAllChilds(obj.nodes[child].nodes);
                    vm.isLoadingChild = false;
                }
            }, 200);
        };

        vm.getDataToShow = function (node) {
            vm._selectedNode = checkText(node.ref);
            vm._node.ref = node.ref;
            vm._node.parent = node.parent;
        };

        vm.search = function (q) {
            var count = 0;
            vm.counter = 0;
            var checkExpand = {
                isExpand: false,
                parent: vm._nodes
            };

            for (var i = 0; i < vm._nodes.length; i++) {
                vm._nodes[i].isSearch = false;

                if (q) {
                    var pattern = new RegExp('(' + q + ')', 'gi');

                    if (pattern.test(vm._nodes[i].ref)) {
                        vm._nodes[i].isSearch = true;
                        ++count;
                    }
                }

                vm.counter = count;
                vm._nodes[i].expanded = true;
                checkExpand.parent = vm._nodes[i];
                getFilteredData(q, vm._nodes[i].nodes, checkExpand);
            }
        };

        function getFilteredData(q, arr, checkExpand) {
            var count = 0;

            for (var i = 0; i < arr.length; i++) {
                arr[i].isSearch = false;

                if (q) {
                    var pattern = new RegExp('(' + q + ')', 'gi');

                    if (pattern.test(arr[i].ref)) {
                        arr[i].isSearch = true;
                        ++count;

                        if (count > 0 && !checkExpand.isExpand) {
                            checkExpand.parent.expanded = true;

                            for (var _i70 = 2; _i70 < 10; _i70++) {
                                var key = 'parent' + _i70;

                                if (checkExpand[key]) {
                                    checkExpand[key].expanded = true;
                                }
                            }

                            checkExpand.isExpand = true;
                        }
                    }
                }
            }

            vm.counter = vm.counter + count;

            for (var _i71 = 0; _i71 < arr.length; _i71++) {
                if (arr[_i71].nodes && arr[_i71].nodes.length > 0) {
                    if (!checkExpand.isExpand) {
                        if (checkExpand.parent.ref === arr[_i71].parent) {
                            checkExpand.parent2 = arr[_i71];
                        }

                        if (checkExpand.parent2 && checkExpand.parent2.ref === arr[_i71].parent) {
                            checkExpand.parent3 = arr[_i71];
                        }

                        if (checkExpand.parent3 && checkExpand.parent3.ref === arr[_i71].parent) {
                            checkExpand.parent4 = arr[_i71];
                        }

                        if (checkExpand.parent4 && checkExpand.parent4.ref === arr[_i71].parent) {
                            checkExpand.parent5 = arr[_i71];
                        }

                        if (checkExpand.parent5 && checkExpand.parent5.ref === arr[_i71].parent) {
                            checkExpand.parent6 = arr[_i71];
                        }

                        if (checkExpand.parent6 && checkExpand.parent6.ref === arr[_i71].parent) {
                            checkExpand.parent7 = arr[_i71];
                        }

                        if (checkExpand.parent7 && checkExpand.parent7.ref === arr[_i71].parent) {
                            checkExpand.parent8 = arr[_i71];
                        }

                        if (checkExpand.parent8 && checkExpand.parent8.ref === arr[_i71].parent) {
                            checkExpand.parent9 = arr[_i71];
                        }

                        if (checkExpand.parent9 && checkExpand.parent9.ref === arr[_i71].parent) {
                            checkExpand.parent10 = arr[_i71];
                        }
                    }

                    getFilteredData(q, arr[_i71].nodes, checkExpand);
                }
            }
        }

        vm.$on('save', function () {
            if (vm.nodes && vm.nodes.length > 0) save();
        });
        vm.$on('validate', function () {
            if (vm.nodes && vm.nodes.length > 0) validate();
        });
        vm.$on('showXml', function () {
            if (vm.nodes && vm.nodes.length > 0) {
                showXml();
            }
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
        vm.$on('deleteAllXML', function () {
            deleteAll();
        });
        vm.$on('reassignSchema', function () {
            reassignSchema();
        });

        function ok(conf) {
            var dom_parser = new DOMParser();
            var dom_document = dom_parser.parseFromString(conf, 'text/xml');

            try {
                if (dom_document.documentElement.getElementsByTagName('parsererror').length > 0 || dom_document.documentElement.nodeName === 'parsererror') {
                    if (dom_document.documentElement.getElementsByTagName('parsererror').length > 0) {
                        toasty.error({
                            title: 'Invalid xml ' + dom_document.documentElement.getElementsByTagName('parsererror')[0].innerText,
                            timeout: 20000
                        });
                    } else {
                        toasty.error({
                            title: 'Invalid xml ' + dom_document.documentElement.firstChild.nodeValue,
                            timeout: 20000
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
                    timeout: 20000
                });
                return true;
            }
        }

        vm.checkBoxCheck = function (data) {
            if (data == 'liveVersion') {
                vm.xmlVersionObj = {
                    draftVersion: false,
                    liveVersion: true
                };
            } else {
                vm.xmlVersionObj = {
                    draftVersion: true,
                    liveVersion: false
                };
            }
        };

        vm.showDiff = function () {
            vm.xmlVersionObj = {
                draftVersion: true,
                liveVersion: false
            };
            vm.draftXml = vm.prevXML;
            var liveVersion;
            EditorService.readXML({
                jobschedulerId: vm.schedulerIds.selected,
                objectType: vm.objectType,
                forceLive: true
            }).then(function (res) {
                if (res.configuration) {
                    vm.schemaIdentifier = res.schemaIdentifier;
                    liveVersion = res.configuration;
                    vm.liveXml = EditorService.diff(vm.draftXml, res.configuration);
                } else {
                    vm.submitXsd = false;
                    vm.isLoading = false;
                    vm.XSDState = res.state;
                    vm.XSDState = Object.assign(vm.XSDState, {
                        warning: res.warning
                    });
                    hideButtons();
                }
            }, function (error) {
                vm.isLoading = false;
                toasty.error({
                    msg: error.data.error.message,
                    timeout: 20000
                });
            });
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/configuration/views/diff-dialog.html',
                controller: 'DialogCtrl1',
                scope: $scope,
                size: 'diff',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                if (vm.xmlVersionObj.liveVersion) {
                    del();
                }
            }, function () {});
        };

        vm.getFirstNotEmptyAttribute = function (attrs) {
            if (attrs && attrs.length > 0) {
                for (var i = 0; i < attrs.length; i++) {
                    if (attrs[i].data) {
                        return attrs[i].name + '=' + attrs[i].data;
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
                        el.style.cssText = 'padding:4px 8px; overflow:hidden;height:' + el.scrollHeight + 'px';
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
                    var end = this.selectionEnd; // set textarea value to: text before caret + tab + text after caret

                    $(this).val($(this).val().substring(0, start) + "\t" + $(this).val().substring(end)); // put caret at right position again

                    this.selectionStart = this.selectionEnd = start + 1;
                }
            });
        };

        function highlightLineNo(num) {
            var lNum = angular.copy(num);
            var dom = document.getElementsByClassName('CodeMirror-code');

            if (dom && dom[0]) {
                if (num > dom[0].children.length) {
                    $('.CodeMirror-scroll').animate({
                        scrollTop: 17.8 * num
                    }, 500);
                }

                setTimeout(function () {
                    dom = document.getElementsByClassName('CodeMirror-code');
                    lNum = angular.copy(num - parseInt(dom[0].children[0].innerText.split(' ')[0].split('↵')[0]) + 1);

                    if (vm.prevErrLine) {
                        dom[0].children[vm.prevErrLine - 1].classList.remove('bg-highlight');
                        var x = dom[0].children[vm.prevErrLine - 1];
                        x.getElementsByClassName('CodeMirror-gutter-elt')[0].classList.remove('text-danger');
                        x.getElementsByClassName('CodeMirror-gutter-elt')[0].classList.remove('bg-highlight');
                    }

                    if (dom[0].children[lNum - 1]) {
                        dom[0].children[lNum - 1].classList.add('bg-highlight');
                        var _x5 = dom[0].children[lNum - 1];

                        _x5.getElementsByClassName('CodeMirror-gutter-elt')[0].classList.add('text-danger');

                        _x5.getElementsByClassName('CodeMirror-gutter-elt')[0].classList.add('bg-highlight');

                        vm.prevErrLine = angular.copy(lNum);
                    }
                }, 500);
            }
        }

        vm.codemirrorLoaded = function (_editor) {
            vm._editor = _editor;

            _editor.setOption('mode', 'xml');
        };

        vm.copyToClipboard = function () {
            clipboard.copyText(vm._editor.getValue());
        };

        vm.showPassword = function (data) {
            data.pShow = !data.pShow;
        }; //hide documentation


        vm.hideDocumentation = function (data) {
            data.show = !data.show;
        };

        vm.hideError = function () {
            vm.error = false;
        }; // goto error location


        vm.gotoErrorLocation = function () {
            if (vm.errorLocation && vm.errorLocation.ref) {
                vm.getData(vm.errorLocation);
                vm.selectedNode = vm.errorLocation;
                vm.errorLocation = {};

                if (vm.errorName && vm.errorName.e === vm.selectedNode.ref) {
                    vm.getAutoFocus(0, vm.selectedNode, 'value');
                }

                if (vm.nodes[0].expanded == false || vm.nodes[0].expanded == undefined) {
                    vm.nodes[0].expanded = true;
                }

                vm.scrollTreeToGivenId(vm.selectedNode.uuid);
            }
        };

        vm.scrollTreeToGivenId = function (id) {
            if (vm.lastScrollId !== id) {
                vm.lastScrollId = angular.copy(id);
            }

            scrollTree(id, function () {
                vm.selectedNode.expanded = true;
                getParentToExpand(vm.selectedNode, vm.nodes[0]);
                vm.selectedNode.expanded = true;
                setTimeout(function () {
                    scrollTree(vm.selectedNode.uuid);
                }, 0);
            });
        };

        function scrollTree(id, cb) {
            var dom = $('#' + id);
            var top;

            if (dom && dom.offset()) {
                if (dom.offset().top < 0) {
                    top = $('.tree-block')[0].scrollTopMax + dom.offset().top;
                } else {
                    top = dom.offset().top;
                }

                $('.tree-block').animate({
                    scrollTop: top - 348
                }, 500);
            } else {
                if (cb) {
                    cb();
                }
            }
        }

        function getParentToExpand(node, list) {
            if (node.parentId === list.uuid && list.parent == '#') {} else {
                if (list.nodes) {
                    for (var i = 0; i < list.nodes.length; i++) {
                        if (node.parentId === list.nodes[i].uuid) {
                            if (!list.nodes[i].expanded) {
                                list.nodes[i].expanded = true;
                            }

                            getParentToExpand(list.nodes[i], vm.nodes[0]);
                        } else {
                            if (list.nodes[i].nodes) {
                                getParentToExpand(node, list.nodes[i].nodes);
                            }
                        }
                    }
                } else {
                    for (var _i72 = 0; _i72 < list.length; _i72++) {
                        if (node.parentId === list[_i72].uuid) {
                            if (!list[_i72].expanded) {
                                list[_i72].expanded = true;
                            }

                            getParentToExpand(list[_i72], vm.nodes[0]);
                        } else {
                            if (list[_i72].nodes) {
                                getParentToExpand(node, list[_i72].nodes);
                            }
                        }
                    }
                }
            }
        }

        vm.getAutoFocus = function (index, node, type) {
            if (node) {
                if (type == 'attribute' && node) {
                    if (vm.errorName && vm.errorName.e === node.name) {
                        return 'true';
                    } else if ((vm.errorName && vm.errorName.e !== node.ref || !vm.errorName) && index == 0) {
                        return 'true';
                    } else {
                        return 'false';
                    }
                } else if (type == 'value' && node) {
                    if (vm.errorName && vm.errorName.e === node.ref) {
                        return 'true';
                    } else if (node && !node.attributes) {
                        return 'true';
                    }
                }
            }

            return false;
        };
        /** ---------------------------tree dropdown actions -------------*/


        vm.addContent = function (data) {
            if (data && data[0] && data[0].data !== undefined) {
                vm.myContent = data[0].data;
            } else {
                vm.myContent = '';
            }
        };

        vm.passwordLabel = function (password) {
            if (password !== undefined) {
                return '********';
            }
        };

        vm.hidePanel = function () {
            vm.sideView.xml.show = false;
            CoreService.hidePanel();
        };

        vm.showLeftPanel = function () {
            vm.sideView.xml.show = true;
            CoreService.showPanel();
        };

        if (!vm.sideView.xml.show) {
            vm.hidePanel();
        }

        vm.setDropdownPosition = function (data, e) {
            $('[data-toggle="popover"]').popover('hide');
            var top = e.clientY + 8;
            var left = e.clientX - 20;

            if (window.innerHeight > top + (180 + (vm.childNode.length > 10 ? 10 : vm.childNode.length) * 22)) {
                $('.list-dropdown').css({
                    top: top + "px",
                    left: left + "px",
                    bottom: 'auto'
                }).removeClass('arrow-down').addClass('dropdown-ac');
                var dom = $('#zoomCn');

                if (dom && dom.css('transform')) {
                    if (dom.css('transform') !== 'none') {
                        $('.list-dropdown').css({
                            '-webkit-transform': 'translateY(-' + (top - 120) + 'px)',
                            '-moz-transform': 'translateY(-' + (top - 120) + 'px)',
                            '-ms-transform': 'translateY(-' + (top - 120) + 'px)',
                            '-o-transform': 'translateY(-' + (top - 120) + 'px)',
                            'transform': 'translateY(-' + (top - 120) + 'px)'
                        });
                    }
                }
            } else {
                $('.list-dropdown').css({
                    top: "auto",
                    left: left + "px",
                    bottom: window.innerHeight - top + 14 + "px"
                }).addClass('arrow-down').removeClass('dropdown-ac');
            }
        }

        $scope.$on('angular-resizable.resizeEnd', function (event, args) {
            if (args.id === 'leftPanel') {
                vm.sideView.xml.width = args.width;
            }
        });

        $scope.$on('$destroy', function () {
            CoreService.setSideView(vm.sideView);
            $('body').removeClass('xml-tooltip');
            vm._activeTab.isVisible = false;
            $scope.changeValidConfigStatus(false);
            $interval.cancel(interval);

            if (vm.submitXsd) {
                storeXML();
            }
        });
    }
})();
