(function () {
    'use strict';
    angular
        .module('app')
        .controller('XMLEditorCtrl', XMLEditorCtrl);

    XMLEditorCtrl.$inject = ['$scope', '$location', '$http', '$uibModal', 'gettextCatalog', 'toasty', 'FileUploader', 'EditorService', 'clipboard', '$interval', '$filter'];

    function XMLEditorCtrl($scope, $location, $http, $uibModal, gettextCatalog, toasty, FileUploader, EditorService, clipboard, $interval, $filter) {
        const vm = $scope;
        vm.counting = 0;
        vm.autoAddCount = 0;
        vm.nodes = [];
        vm.childNode = [];
        vm.selectedXsd = {xsd: ''};
        vm.submitXsd = false;
        vm.isLoading = true;
        vm.fileLoading = false;
        vm.showSelectSchema = false;
        vm.recreateJsonFlag = false;
        vm.objectXml = {};
        $('body').addClass('xml-tooltip');

        vm.treeOptions = {
            beforeDrop: function (e) {
                let sourceValue = e.source.nodeScope.$modelValue,
                    destValue = e.dest.nodesScope.node ? e.dest.nodesScope.node : undefined;
                if (destValue && destValue.nodes && destValue.nodes.length > 0) {
                    vm.addOrderOnIndividualData(destValue);
                }
                return dragAndDropRules(sourceValue, destValue, e);
            },
            dragStop: function (e) {
                e.dest.nodesScope.node.nodes = _.orderBy(e.dest.nodesScope.node.nodes, ['order'], ['asc']);
            }
        };

        const uploader = $scope.uploader = new FileUploader({
            url: '',
            alias: 'file'
        });

        // CALLBACKS
        uploader.onAfterAddingFile = function (item) {
            let fileExt = item.file.name.slice(item.file.name.lastIndexOf('.') + 1).toUpperCase();
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
            let reader = new FileReader();
            reader.readAsText(item._file, 'UTF-8');
            reader.onload = onLoadFile;
        }


        const interval = $interval(function () {
            if (vm.submitXsd && !vm.objectXml.xml) {
                storeXML();
            }
        }, 30000);

        function compare(str1, str2) {
            let a = str1.replace(/\s/g, '');
            let b = str2.replace(/\s/g, '');
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
            let eRes;
            if (vm.prevXML && vm._xml) {
                eRes = compare(vm.prevXML.toString(), vm._xml.toString());
            }
            if (!eRes && vm.objectType !== 'OTHER') {
                EditorService.storeXML({
                    jobschedulerId: vm.schedulerIds.selected,
                    objectType: vm.objectType,
                    configuration: vm._xml,
                    configurationJson: JSON.stringify({nodesCount: vm.counting, node: vm.nodes}),
                }).then(function (res) {
                    vm.isDeploy = false;
                    vm.XSDState = Object.assign({}, {message: res.message});
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
                    configurationJson: JSON.stringify({nodesCount: vm.counting, node: vm.nodes}),
                    id: vm.activeTab.id,
                    name: vm.activeTab.name,
                    schemaIdentifier: vm.schemaIdentifier,
                    schema: vm.path
                }).then(function (res) {
                    vm.isDeploy = false;
                    vm.XSDState = Object.assign({}, {message: res.message});
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
                    title: (!vm.importXSDFile) ? gettextCatalog.getString('xml.message.invalidXMLFile') : gettextCatalog.getString('xml.message.invalidXSDFile'),
                    timeout: 10000
                });
            }
        }

        vm.collapseAll = function () {
            for (let i = 0; i < vm.nodes.length; i++) {
                if (vm.nodes[i].nodes && vm.nodes[i].nodes.length > 0) {
                    vm.nodes[i].expanded = false;
                    expandCollapseRec(vm.nodes[i].nodes, false);
                }
            }
        };

        function expandCollapseRec(node, flag) {
            for (let i = 0; i < node.length; i++) {
                if (node[i].nodes && node[i].nodes.length > 0) {
                    node[i].expanded = flag;
                    expandCollapseRec(node[i].nodes, flag);
                }
            }
        }

        vm.expandAll = function () {
            for (let i = 0; i < vm.nodes.length; i++) {
                if (vm.nodes[i].nodes && vm.nodes[i].nodes.length > 0) {
                    vm.nodes[i].expanded = true;
                    expandCollapseRec(vm.nodes[i].nodes, true);
                }
            }
        };

        vm.collapseAll1 = function () {
            for (let i = 0; i < vm._nodes.length; i++) {
                vm._nodes[i].expanded = false;
                if (vm._nodes[i].nodes && vm._nodes[i].nodes.length > 0) {
                    expandCollapseRec(vm._nodes[i].nodes, false);
                }
            }
        };

        vm.expandAll1 = function () {
            for (let i = 0; i < vm._nodes.length; i++) {
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
            vm.selectedXsd.xsd = (vm.schemaIdentifier) ? vm.schemaIdentifier : vm.selectedXsd.xsd;
            if (localStorage.getItem('schemas'))
                vm.otherSchema = localStorage.getItem('schemas').split(',');
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
                }
            } else {
                obj = {
                    jobschedulerId: vm.schedulerIds.selected,
                    objectType: "OTHER",
                    fileName: vm.uploader.queue[0]._file.name,
                    fileContent: vm.uploadData,
                    configuration: _showXml()
                }
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
            let d = data.replace(/\<\!\-\-((?!\-\-\>)[\s\S])*\-\-\>\s*/g, '');
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
                    let _tempArrToExpand = [];
                    vm.prevXML = removeComment(res.configuration);
                    let jsonArray;
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
                        let a = [jsonArray];
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
                            for (let i = 0; i < _tempArrToExpand.length; i++) {
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
                    vm.XSDState = Object.assign(vm.XSDState, {warning: res.warning});
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
            for (let i = 0; i < nodes.length; i++) {
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
                let a = vm.checkChildNode(node);
                if (a && a.length > 0 && node && node.nodes && node.nodes.length > 0) {
                    for (let j = 0; j < node.nodes.length; j++) {
                        for (let i = 0; i < a.length; i++) {
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
                let nod = {ref: node.parent};
                let a = vm.checkChildNode(nod);
                if (a && a.length > 0) {
                    for (let i = 0; i < a.length; i++) {
                        if (a[i].ref === node.ref) {
                            node = Object.assign(node, a[i]);
                        }
                    }
                }
                a = vm.checkChildNode(node);
                if (a && a.length > 0) {
                    for (let i = 0; i < a.length; i++) {
                        for (let j = 0; j < node.nodes.length; j++) {
                            if (a[i].ref == node.nodes[j].ref) {
                                node.nodes[j] = Object.assign(node.nodes[j], a[i]);
                            }
                        }
                    }
                }
            }
        }

        vm.getIndividualData = function (node, scroll) {
            let attrs = checkAttributes(node.ref);
            if (attrs && attrs.length > 0) {
                if (node.attributes && node.attributes.length > 0) {
                    for (let i = 0; i < attrs.length; i++) {
                        for (let j = 0; j < node.attributes.length; j++) {
                            checkAttrsValue(attrs[i]);
                            checkAttrsText(attrs[i]);
                            if (attrs[i].name == node.attributes[j].name) {
                                attrs[i] = Object.assign(attrs[i], node.attributes[j]);
                            }
                        }
                    }
                }
            }
            let value = getValues(node.ref);
            if (node.values && node.values.length > 0) {
                for (let i = 0; i < value.length; i++) {
                    for (let j = 0; j < node.values.length; j++) {
                        if (value[i].parent === node.values[j].parent) {
                            value[i] = Object.assign(value[i], node.values[j]);
                        }
                    }
                }
            }
            let attrsType = getAttrFromType(node.ref, node.parent);
            if (attrsType && attrsType.length > 0) {
                if (node.attributes && node.attributes.length > 0) {
                    for (let i = 0; i < attrsType.length; i++) {
                        for (let j = 0; j < node.attributes.length; j++) {
                            if (attrsType[i].name == node.attributes[j].name) {
                                attrsType[i] = Object.assign(attrsType[i], node.attributes[j]);
                            }
                        }
                    }
                }
            }
            let valueType = getValueFromType(node.ref, node.parent);

            if (valueType) {
                if (node.values && node.values.length > 0) {
                    for (let i = 0; i < valueType.length; i++) {
                        for (let j = 0; j < node.values.length; j++) {
                            if (valueType[i].parent === node.values[j].parent) {
                                valueType[i] = Object.assign(valueType[i], node.values[j]);
                            }
                        }
                    }
                }
            }
            let val = getVal(node);
            if (val) {
                if (node.values && node.values.length > 0) {
                    for (let i = 0; i < val.length; i++) {
                        for (let j = 0; j < node.values.length; j++) {
                            if (val[i].parent === node.values[j].parent) {
                                val[i] = Object.assign(val[i], node.values[j]);
                            }
                        }
                    }
                }
            }
            if ((_.isEmpty(val)) && (_.isEmpty(value)) && (_.isEmpty(valueType))) {
                val = getValFromDefault(node);
                if (node.values && node.values.length > 0) {
                    for (let i = 0; i < val.length; i++) {
                        for (let j = 0; j < node.values.length; j++) {
                            if (val[i].parent === node.values[j].parent) {
                                val[i] = Object.assign(val[i], node.values[j]);
                            }
                        }
                    }
                }
            }
            if (!(_.isEmpty(attrs))) {
                attachAttrs(attrs, node);
            }
            if (!(_.isEmpty(val))) {
                node.values = angular.copy([]);
                for (let j = 0; j < val.length; j++) {
                    val[j].uuid = vm.counting;
                    vm.counting++;
                    if (val[j].base === 'password') {
                        val[j].pShow = false;
                    }
                    if (node && node.values) {
                        node.values = angular.copy([]);
                        node.values.push(val[j]);
                    }
                }
            }
            if (!(_.isEmpty(value))) {
                node.values = [];
                for (let j = 0; j < value.length; j++) {
                    value[j].uuid = vm.counting;
                    vm.counting++;
                    if (value[j].base === 'password') {
                        value[j].pShow = false;
                    }
                    if (node && node.values) {
                        node.values = angular.copy([]);
                        node.values.push(value[j]);
                    }
                }
            }
            if (valueType !== undefined) {
                for (let j = 0; j < valueType.length; j++) {
                    valueType[j].uuid = vm.counting;
                    vm.counting++;
                    if (valueType[j].base === 'password') {
                        valueType[j].pShow = false;
                    }
                    if (node && node.values) {
                        node.values = angular.copy([]);
                        node.values.push(valueType[j]);
                    }
                }
            }
            if (attrsType !== undefined) {
                for (let j = 0; j < attrsType.length; j++) {
                    for (let i = 0; i < node.attributes.length; i++) {
                        if (attrsType[j].name !== node.attributes[i].name) {
                            attrsType[j].uuid = vm.counting;
                            vm.counting++;
                            if (attrsType[j].name === 'password') {
                                attrsType[j].pShow = false;
                            }
                            node.attributes.push(attrsType[j]);
                        } else {
                            node.attributes[i] = Object.assign(node.attributes[i], attrsType[j]);
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

        vm.checkOrder = function(node) {
            setTimeout(() => {
                if(node && vm.childNode.length>0) {
                    if (vm.childNode && vm.childNode.length > 0 && node && node.nodes && node.nodes.length > 0) {
                        for (let j = 0; j < node.nodes.length; j++) {
                            for (let i = 0; i < vm.childNode.length; i++) {
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
        }

        // submit xsd to open
        function submit() {
            vm.ckEditor = null;
            let path = $location.path();
            let x = path.split('/')[2];
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
                    if(res.schemas) {
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
                    vm.error = true;
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
                vm.error = true;
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
                        editJson[rootNode]['_cdata'] = editJson[rootNode]['_text'];
                        delete editJson[rootNode]['_text'];
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
                editJson['_cdata'] = editJson['_text'];
                delete editJson['_text'];
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
                    addChildForXml(key, rootNode, xmljson, mainjson);
                }
            }
        }

        function addChildForXml(key, rootNode, xmljson, mainjson) {
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
            if (typeof (data.data) === 'string' && data && data.data && data.data.match(/<[^>]+>/gm)) {
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
                    let b = element[i].nodeValue[0].innerHTML;
                    text = Object.assign(text, {[a]: b});
                }
            } else {
                let documentationPath1 = '/xs:schema/xs:element[@ref=\'' + node + '\']/xs:annotation/xs:documentation/@*';
                let element1 = select(documentationPath1, vm.doc);
                for (let i = 0; i < element1.length; i++) {
                    let a = element1[i].nodeName;
                    let b = element1[i].nodeValue[0].innerHTML;
                    text = Object.assign(text, {[a]: b});
                }
            }
            let documentationPath2 = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:annotation/xs:documentation';
            let element2 = select(documentationPath2, vm.doc);
            if (element2.length > 0) {
                text.doc = element2[0].innerHTML;
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
                    if (text.doc) {
                        node.text = text;
                    }

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

        vm.checkChildNode = function (_nodes, data) {
            let node = _nodes.ref;
            let parentNode;
            if(!data) {
                vm.childNode = [];
            }
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
                            if(data) {
                                data.nodes = childArr;
                            }else{
                                vm.childNode = childArr;
                            }

                        }
                    }
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
                            if(data) {
                                data.nodes = childArr;
                            }else{
                                vm.childNode = childArr;
                            }
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
                            if (nodes.ref !== 'Minimum' && nodes.ref !== 'Maximum') {
                                nodes.choice = node;
                            }
                            if (nodes.minOccurs && !nodes.maxOccurs) {
                            } else {
                                childArr.push(nodes);
                            }
                            if(data) {
                                data.nodes = childArr;
                            }else{
                                vm.childNode = childArr;
                            }
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
                            if(data) {
                                data.nodes = childArr;
                            }else{
                                vm.childNode = childArr;
                            }
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
                                if(data) {
                                    data.nodes = childArr;
                                }else{
                                    vm.childNode = childArr;
                                }
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
                                if(data) {
                                    data.nodes = childArr;
                                }else{
                                    vm.childNode = childArr;
                                }
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
                                    if(data) {
                                        data.nodes = childArr;
                                    }else{
                                        vm.childNode = childArr;
                                    }
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
                                    if(data) {
                                        data.nodes = childArr;
                                    }else{
                                        vm.childNode = childArr;
                                    }
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
                            addTypeChildNode(typeElement[0].attributes[i].nodeValue, parentNode, data);
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

        function addTypeChildNode(node, parent, data) {
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
                            if(data) {
                                data.nodes = childArr;
                            }else{
                                vm.childNode = childArr;
                            }
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
                            if(data) {
                                data.nodes = childArr;
                            }else{
                                vm.childNode = childArr;
                            }
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
                            if(data) {
                                data.nodes = childArr;
                            }else{
                                vm.childNode = childArr;
                            }
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
                            if(data) {
                                data.nodes = childArr;
                            }else{
                                vm.childNode = childArr;
                            }
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
            if (!(_.isEmpty(attrs))) {
                attachAttrs(attrs, child);
            }
            nodeArr.nodes.push(child);
            nodeArr.nodes = _.orderBy(nodeArr.nodes, ['order'], ['asc']);
            if (check) {
                if ((nodeArr && (nodeArr.ref !== "SystemMonitorNotification" || (nodeArr.ref === "SystemMonitorNotification" && child.ref !== 'Timer')))) {
                    autoAddChild(child);
                }
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
            vm.selectedNode = child;
            vm.getData(vm.selectedNode);
            if (vm.nodes.length > 0) {
                vm.scrollTreeToGivenId(vm.selectedNode.uuid);
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
        function dragAndDropRules(dragNode, dropNode, e) {
            if (dragNode && dropNode) {
                if (dropNode.ref === dragNode.parent) {
                    let count = 0;
                    if (dragNode.maxOccurs === 'unbounded') {
                        $scope.changeValidConfigStatus(false);
                        dragNode.parentId = angular.copy(dropNode.uuid);
                        return true;
                    } else if (dragNode.maxOccurs !== 'unbounded' && dragNode.maxOccurs !== undefined) {
                        if (dropNode.nodes.length > 0) {
                            for (let i = 0; i < dropNode.nodes.length; i++) {
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
                                return (dragNode.ref !== dropNode.nodes[0].ref);
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
        };

        // to send data in details component
        vm.getData = function (evt) {
            if (evt && evt.keyref) {
                for (let i = 0; i < evt.attributes.length; i++) {
                    if (evt.attributes[i].name === evt.keyref) {
                        vm.getDataAttr(evt.attributes[i].refer);
                        break;
                    }
                }
            }
            if (evt.ref === 'Body') {
                setTimeout(() => {
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
                        if (childNode[i] && childNode[i].attributes) {
                            for (let j = 0; j < childNode[i].attributes.length; j++) {
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
                        for (let j = 0; j < attrs.length; j++) {
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
                let value;
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

        function getChildFromBase(child, tagName, tempNode) {
            if (vm.doc.getElementsByTagName('xs:complexType') !== undefined) {
                var rootChildChilds = vm.doc.getElementsByTagName('xs:complexType');
            }
            let rootChildChildsarr = [];
            let childElement;
            let count = 0;
            for (let i = 0; i < rootChildChilds.length; i++) {
                if (rootChildChilds.item(i).getAttributeNode('name') !== undefined) {
                    rootChildChildsarr[count] = rootChildChilds.item(i).getAttributeNode('name');
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
            for (let i = 0; i < rootChildChilds.length; i++) {
                if (rootChildChilds.item(i).getAttributeNode('name') !== undefined) {
                    rootChildChildsarr[count] = rootChildChilds.item(i).getAttributeNode('name');
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
            addKeyAndKeyRef(key);
        }

        function attachKeyRefNodes(keyrefnodes) {
            addKeyAndKeyRef(keyrefnodes);
        }

        function addKeyAndKeyRef(nodes) {
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
            vm.dRefFlag = 0;
            $scope.changeValidConfigStatus(false);
            if (node.parent === '#') {
            } else {
                vm.isNext = false;
                getParent(node, vm.nodes[0]);
            }
            if(vm.selectedNode.ref === node.ref){
                vm.selectedNode = vm.nodes[0];
                vm.getIndividualData(vm.selectedNode);
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
            if(child.ref == node.ref) {
                if(child.attributes) {
                    for (let i = 0; i < child.attributes.length; i++) {
                        for (let j = 0; j < node.attributes.length; j++) {
                            if(child.attributes[i].name == node.attributes[j].name) {
                                vm.dRefFlag++;
                                break;
                            }
                        }
                    }
                }
            } else {
                if(child.nodes && child.nodes.length>0) {
                    for (let i = 0; i < child.nodes.length; i++) {
                        checkRefPresent(node, child.nodes[i]);
                    }
                }
            }
            if(vm.dRefFlag<1) {
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

        function deleteKeyRefData(child, node) {
            if(child.ref === node.ref+'Ref') {
                if (child.keyref) {
                    if (child && child.attributes && child.attributes.length > 0) {
                        for (let i = 0; i < child.attributes.length; i++) {
                            if (child.keyref === child.attributes[i].name && node && node.attributes) {
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
        }

        // Cut Node
        vm.cutNode = function (node) {
            $scope.changeValidConfigStatus(false);
            vm.copyItem = {};
            vm.copyItem = Object.assign(vm.copyItem, node);
            vm.cutData = true;
            if (vm.XSDState && vm.XSDState.message && vm.XSDState.message.code == 'XMLEDITOR-101') {
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
            vm.copyItem = undefined;
            vm.cutData = false;
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
                vm.checkRule = false;
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
                                if (copyNode.ref === pasteNode.nodes[i].ref) {
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
        };

        // Paste Node
        vm.pasteNode = function (node) {
            if(vm.cutData) {
                searchAndRemoveNode(vm.copyItem);
            }
            vm.copyItem.uuid = node.uuid + vm.counting;
            vm.counting++;
            if(vm.copyItem && !vm.copyItem.order) {
                let a = vm.checkChildNode(node);
                if(a && a.length>0) {
                    for (let i = 0; i < a.length; i++) {
                        if (a[i].ref ===  vm.copyItem.ref) {
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
                    for (let i = 0; i < copyData.attributes.length; i++) {
                        if (copyData.attributes[i].name === 'profile_id' && copyData.attributes[i].data) {
                            for (let j = 0; j < node.nodes.length; j++) {
                                for (let k = 0; k < node.nodes[j].attributes.length; k++) {
                                    if (node.nodes[j].attributes[k].name == 'profile_id' && node.nodes[j].attributes[k].data) {
                                        if (node.nodes[j].attributes[k].data.match(/-copy[0-9]+/i)) {
                                            tName = angular.copy(node.nodes[j].attributes[k].data);
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                        if (!tName && copyData.attributes[i].data) {
                            tName = copyData.attributes[i].data + '-copy1';
                        } else if(tName){
                            tName = tName.split('-copy')[1];
                            tName = parseInt(tName) || 0;
                            tName = (copyData.attributes[i].data || 'profile') + '-copy' +  (tName + 1);
                        }
                        if(tName)
                        copyData.attributes[i].data = angular.copy(tName);
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
                let doc = document.implementation.createDocument('', '', null);
                let peopleElem = doc.createElement(vm.nodes[0].ref);
                if (peopleElem) {
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
                }
                return peopleElem;
            }
        }

        function createChildJson(node, childrenNode, currentNode, doc) {
            if (childrenNode && childrenNode.attributes) {
                for (let i = 0; i < childrenNode.attributes.length; i++) {
                    if (childrenNode.attributes[i].data) {
                        currentNode.setAttribute(childrenNode.attributes[i].name, childrenNode.attributes[i].data);
                    } else if (childrenNode.attributes[i].data == false) {
                        currentNode.setAttribute(childrenNode.attributes[i].name, childrenNode.attributes[i].data);
                    }
                }
            }
            if (childrenNode && childrenNode.values && childrenNode.values.length >= 0) {
                for (let i = 0; i < childrenNode.values.length; i++) {
                    if (childrenNode.values[i].data) {
                        let a = doc.createCDATASection(childrenNode.values[i].data);
                        if (a) {
                            currentNode.appendChild(a);
                        }
                    }
                }
            }
            if (childrenNode.nodes && childrenNode.nodes.length > 0) {
                for (let i = 0; i < childrenNode.nodes.length; i++) {
                    createChildJson(currentNode, childrenNode.nodes[i], doc.createElement(childrenNode.nodes[i].ref), doc);
                }
            }
            node.appendChild(currentNode);
        }

        function _showXml() {
            let xml = jsonToXml();
            if (xml) {
                let xmlAsString = new XMLSerializer().serializeToString(xml);
                let a = `<?xml version="1.0" encoding="UTF-8"?>`;
                a = a.concat(xmlAsString);
                return vkbeautify.xml(a, 2);
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
        vm.validateAttr = function (value, tag) {
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
                if (/[a-zA-Z0-9_/s/*]+.*$/.test(value)) {
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
            } else if (tag.type === 'xs:anyURI') {
                if (value) {
                    if (value == '' && tag.use === 'required') {
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
                    } else if (!(EditorService.xsdAnyURIValidation(value))) {
                        vm.error = true;
                        vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.notValidUrl');
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
                }
            } else {
                tag = Object.assign(tag, {data: value});
                vm.autoValidate();
            }
        };


        vm.checkDupProfileId = function (value, tag) {
            if (tag.name == 'profile_id' && vm.selectedNode.ref == 'Profile') {
                getParentNode(vm.selectedNode, vm.nodes[0]);
                if (vm.tempParentNode && vm.tempParentNode.nodes.length > 0) {
                    for (let i = 0; i < vm.tempParentNode.nodes.length; i++) {
                        if(vm.tempParentNode.nodes[i].attributes) {
                            for (let j = 0; j < vm.tempParentNode.nodes[i].attributes.length; j++) {
                                if (vm.tempParentNode.nodes[i].uuid != vm.selectedNode.uuid && vm.tempParentNode.nodes[i].attributes[j].id !== tag.id) {
                                    if (vm.tempParentNode.nodes[i].attributes[j].data === value) {
                                        vm.error = true;
                                        vm.errorName = {e: tag.name};
                                        vm.text = tag.name + ':' + gettextCatalog.getString('message.uniqueError');
                                        if (tag.data !== undefined) {
                                            for (let key in tag) {
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
                        tag = Object.assign(tag, {data: value});
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
                if (/[a-zA-Z0-9_\\s\*]+.*$/.test(value)) {
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
            } else if (tag.type === 'xs:anyURI') {
                if (value) {
                    if (value == '' && tag.use === 'required') {
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
                    }
                    if ((EditorService.xsdAnyURIValidation(value)) === false) {
                        vm.error = true;
                        vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.notValidUrl');
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
                } else if (tag.type === 'xs:boolean' && value === false) {
                    tag = Object.assign(tag, {data: value});
                    vm.autoValidate();
                } else if (value == '') {
                    tag = Object.assign(tag, {data: tag.defalut});
                    vm.autoValidate();
                }
            }
        };

        // toaster pop toast
        function popToast(node) {
            let msg;
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
            vm.scrollTreeToGivenId(vm.selectedNode.uuid);
        };

        vm.getPos = function (node) {
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
                let flg = true;
                for (let i = 0; i < vm.childNode.length; i++) {
                    if (vm.childNode[i] && vm.childNode[i].choice) {
                        if (node && node.nodes && node.nodes.length > 0) {
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
                            let temp = '<tr><td class="tTable">';
                            temp = temp + node.attributes[i].name;
                            temp = temp + '</td><td class="tTable">';
                            temp = temp + node.attributes[i].data;
                            temp = temp + '</td></tr>';
                            vm.tooltipAttrData = vm.tooltipAttrData + temp;
                        } else {
                            let temp = '<tr><td>';
                            temp = temp + node.attributes[i].name;
                            temp = temp + '</td><td>';
                            temp = temp + vm.passwordLabel(node.attributes[i].data);
                            temp = temp + '</td></tr>';
                            vm.tooltipAttrData = vm.tooltipAttrData + temp;
                        }
                    }
                }
                if (vm.tooltipAttrData !== '') {
                    vm.tooltipAttrData = '<table class="tTable">' + vm.tooltipAttrData + '</table>';
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
            if (node) {
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
                vm.scrollTreeToGivenId(vm.selectedNode.uuid);
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
                    for (let i = 0; i < list.nodes.length; i++) {
                        if (node.parentId === list.nodes[i].uuid) {
                            list.nodes[i].expanded = true;
                            vm.tempParentNode = list.nodes[i];
                        } else {
                            getParentNode(node, list.nodes[i]);
                        }
                    }
                }
            }
        }

        // validate xml
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
                    vm.errorName = {e: vm.nonValidattribute.parent};
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
            let obj = {
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
            let iNode = {
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
            for (let j = 0; j < nodes.length; j++) {
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
            let modalInstance = $uibModal.open({
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
        };

        // import xml model
        function importXML() {
            if (localStorage.getItem('schemas')) {
                vm.otherSchema = localStorage.getItem('schemas').split(',');
            }
            if (vm.objectType === 'OTHER') {
                vm.importObj = {assignXsd: vm.schemaIdentifier};
            } else {
                vm.importObj = {assignXsd: vm.objectType};
            }

            let modalInstance = $uibModal.open({
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
                                let _tab = angular.copy({id: -1, name: 'edit1', schemaIdentifier: vm.schemaIdentifier});
                                vm.tabsArray.push(_tab);
                                EditorService.readXML({
                                    jobschedulerId: vm.schedulerIds.selected,
                                    objectType: vm.objectType,
                                    id: _tab.id
                                }).then(function (res) {
                                    vm.activeTab = vm.tabsArray[0];
                                    getXsdSchema()
                                }, function (err) {
                                    toasty.error({
                                        msg: err.data.error.message,
                                        timeout: 20000
                                    });
                                    vm.isLoading = false;
                                })
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
            let obj = {
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
            })
        }

        function xmlToJsonService() {
            let obj = {
                jobschedulerId: vm.schedulerIds.selected,
                objectType: vm.objectType,
                configuration: vm.uploadData
            };
            if (vm.objectType === 'OTHER') {
                obj.schemaIdentifier = vm.schemaIdentifier;
            }
            EditorService.xmlToJson(obj).then(function (res) {
                $scope.changeValidConfigStatus(false);
                let a = [];
                let arr = JSON.parse(res.configurationJson);
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
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/configuration/views/object-xml-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {

            }, function () {
                vm.objectXml = {};
                toasty.clear();
            });
        }

        // open new Conformation model
        function newFile() {
            vm.ckEditor = null;
            vm.delete = false;
            if (vm.submitXsd && vm.objectType !== 'OTHER') {
                let modalInstance = $uibModal.open({
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
            let _tab;
            if (vm.tabsArray.length === 0) {
                _tab = angular.copy({id: -1, name: 'edit1'});
            } else {
                let tempName;
                _tab = angular.copy(vm.tabsArray[vm.tabsArray.length - 1]);
                _tab.id = Math.sign(angular.copy(_tab.id - 1)) === 1 ? -1 : angular.copy(_tab.id - 1);
                for (let i = 0; i < vm.tabsArray.length; i++) {
                    if (vm.tabsArray[i].name) {
                        let _arr = vm.tabsArray[i].name.match(/[a-zA-Z]+/g);
                        if (_arr && _arr.length > 0 && _arr[0] === 'edit') {
                            if (!tempName) {
                                tempName = vm.tabsArray[i].name;
                            }
                            if (tempName && (parseInt(vm.tabsArray[i].name.match(/\d+/g)[0]) > parseInt(tempName.match(/\d+/g)[0]))) {
                                tempName = vm.tabsArray[i].name;
                            }
                        }
                    }
                }
                if (tempName) {
                    _tab.name = angular.copy('edit' + (parseInt(tempName.match(/\d+/g)[0]) + 1))
                } else {
                    _tab.name = 'edit1'
                }
            }
            _tab.schemaIdentifier = null;
            vm.tabsArray.push(_tab);
            vm.reassignSchema = false;
            vm.activeTab = _tab;
            vm._activeTab.isVisible = true;
            readOthersXSD(_tab.id)
        }

        vm.changeTab = function (data, isStore) {
            if(!data.schemaIdentifier) {
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
                    })
                }
            }
            $scope.changeValidConfigStatus(false);
        };

        vm.cancelRename = function(data){
            delete data['rename'];
            data.name = angular.copy(vm.oldName);
            vm.oldName = null;
        };

        vm.renameTab = function (tab) {
            if (vm.schemaIdentifier) {
                tab.rename = true;
                vm.oldName = angular.copy(tab.name);
                let wt = $('#'+tab.id).width();
                setTimeout(function(){
                    let dom =  $('#rename-field');
                    dom.width(wt);
                    dom.focus();
                    try {
                        dom.select();
                    }catch (e) {

                    }
                },0)
            }
        };

        vm.renameOnEnter = function ($event, data) {
            let key = $event.keyCode || $event.which;
            if(key === 13) {
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
            }else{
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
                            let _tempArrToExpand = [];
                            let a;
                            try {
                                a = JSON.parse(res.configuration.configurationJson);
                            } catch (error) {
                                vm.isLoading = false;
                                vm.submitXsd = false;
                            }
                            if(!res.configuration.recreateJson) {
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
                                    for (let i = 0; i < _tempArrToExpand.length; i++) {
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
                        if(vm.objectType == 'OTHER') {
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
            let obj = {
                jobschedulerId: vm.schedulerIds.selected,
                objectType: vm.objectType,
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
                    configurationJson: JSON.stringify({nodesCount: vm.counting, node: vm.nodes}),
                }).then(function (res) {
                    if (res.validationError) {
                        showError(res.validationError);
                    } else {
                        vm.prevXML = vm._xml;
                        vm.isDeploy = true;
                        vm.XSDState = Object.assign({}, {message: res.message});
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
        }

        // save xml
        function save() {
            let xml = _showXml();
            let name;
            if (vm.objectType === 'OTHER') {
                name = vm.activeTab.name + '.xml';
            } else {
                name = vm.nodes[0].ref + '.xml';
            }
            let fileType = 'application/xml';
            let blob = new Blob([xml], {type: fileType});
            saveAs(blob, name);
        }

        // create Xml from Json
        function showXml() {
            vm.editorOptions.readOnly = false;
            vm.objectXml = {};
            vm.objectXml.isXMLEditor = true;
            vm.objectXml.xml = _showXml();
            vm.isEditable = true;
            let modalInstance = $uibModal.open({
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
            let data = vm._editor.getValue();
            let obj = {
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
                    let a = [];
                    let arr = JSON.parse(res.configurationJson);
                    a.push(arr);
                    vm.counting = arr.lastUuid;
                    vm.doc = new DOMParser().parseFromString(vm.path, 'application/xml');
                    vm.nodes = a;
                    vm.submitXsd = true;
                    let x = {state: {message: res.message}};
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

        vm.validateXML = function(){
            let obj = {
                jobschedulerId: vm.schedulerIds.selected,
                objectType: vm.objectType,
                configuration: vm._editor.getValue()
            };
            if (vm.objectType === 'OTHER') {
                obj.schemaIdentifier =  vm.activeTab.schemaIdentifier;
            }
            EditorService.validateXML(obj).then(function (res) {
                if (res.validationError) {
                    highlightLineNo(res.validationError.line);
                    toasty.error({
                        msg: res.validationError.message,
                        timeout: 20000
                    });
                }else{
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
                vm.ckEditor.destroy()
            }
            try {
                CKEDITOR.replace('ckEditorId', {
                    plugins: 'tableselection,blockquote,contextmenu,wysiwygarea,link,list,table,tab,tabletools,undo,htmlwriter,toolbar,sourcearea,specialchar,indentlist,enterkey,basicstyles,clipboard,stylescombo,format',
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
                vm.ckEditor = CKEDITOR.instances['ckEditorId'];
            } catch (e) {
                console.error(e)
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
                let x = evn.replace(/<[^>]+>/gm, '');
                if (x !== '&nbsp;') {
                    x = x.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<");
                    nodes.values[0] = Object.assign(nodes.values[0], {data: x});
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
            vm.deleteAll = false;
            let modalInstance = $uibModal.open({
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
        }

        //delete all config
        function deleteAll() {
            vm.deleteAll = true;
            vm.delete = false;
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/configuration/views/confirmation-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function (res) {
                let obj = {
                    jobschedulerId: vm.schedulerIds.selected,
                    objectTypes: ["OTHER"],
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
                for (let i = 0; i < vm.tabsArray.length; i++) {
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
            let obj = {
                jobschedulerId: vm.schedulerIds.selected,
                objectType: vm.objectType,
            };
            if (vm.objectType == 'OTHER') {
                obj.id = vm.activeTab.id
            }
            EditorService.deleteXML(obj).then(function (res) {
                if (res.configuration) {
                    if (!ok(res.configuration)) {
                        let obj1 = {
                            jobschedulerId: vm.schedulerIds.selected,
                            objectType: vm.objectType,
                            configuration: res.configuration
                        };
                        if (vm.objectType === 'OTHER') {
                            obj1.schemaIdentifier = vm.schemaIdentifier;
                        }
                        EditorService.xmlToJson(obj1).then(function (result) {
                            vm.isLoading = true;
                            let a = [];
                            let arr = JSON.parse(result.configurationJson);
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
                            vm.tabsArray = vm.tabsArray.filter(x => {
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
                        vm.tabsArray = vm.tabsArray.filter(x => {
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
            for (const child in list) {
                list[child].nodes = [];
                vm.checkChildNode(list[child], list[child]);
                recursiveGetAllChilds(list[child].nodes);
            }
        }

        function getAllChilds(list) {
            for (const child in list) {
                list[child].nodes = [];
                vm.checkChildNode(list[child], list[child]);
            }
        }

        // Show all Child Nodes and search functionalities.
        vm.showAllChildNode = function (node) {
            vm.isLoadingChild = true;
            vm._nodes = [];
            vm._selectedNode = node.text;
            vm._node = {ref: node.ref, parent: node.parent, nodes : [], expanded: true};
            vm.checkChildNode(vm._node, vm._node);
            vm._nodes.push(vm._node);
            getAllChilds(vm._node.nodes);
            $uibModal.open({
                templateUrl: 'modules/configuration/views/show-childs-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            setTimeout(function () {
                for (const child in vm._node.nodes) {
                    vm._node.nodes[child].nodes = [];
                    vm.checkChildNode(vm._node.nodes[child], vm._node.nodes[child]);
                    recursiveGetAllChilds(vm._node.nodes[child].nodes);
                    vm.isLoadingChild = false;
                }
            }, 100);
        };

        vm.getDataToShow = function(node){
            vm._selectedNode = checkText(node.ref);
        };

        vm.search = function(q){
            let found = $filter('filter')(vm._nodes, q);
            vm.counter = found.length;
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
            let dom_parser = new DOMParser();
            let dom_document = dom_parser.parseFromString(conf, 'text/xml');
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
                    vm.XSDState = Object.assign(vm.XSDState, {warning: res.warning});
                    hideButtons();
                }
            }, function (error) {
                vm.isLoading = false;
                toasty.error({
                    msg: error.data.error.message,
                    timeout: 20000
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
                    }
                }
            } else {
                return '';
            }
        };

        vm.autosize = function (evt) {
            if (evt) {
                let el = document.getElementById(evt);
                if (el !== null) {
                    setTimeout(function () {
                        el.style.cssText = 'padding:4px 8px; overflow:hidden;height:' + el.scrollHeight + 'px';
                    }, 0);
                }
            }
        };

        vm.checkForTab = function (id) {
            $(document).delegate('#' + id, 'keydown', function (e) {
                let keyCode = e.keyCode || e.which;
                if (keyCode == 9) {
                    e.preventDefault();
                    let start = this.selectionStart;
                    let end = this.selectionEnd;
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

        function highlightLineNo(num) {
            let lNum = angular.copy(num);
            let dom = document.getElementsByClassName('CodeMirror-code');
            if (dom && dom[0]) {
                if (num > dom[0].children.length) {
                    $('.CodeMirror-scroll').animate({
                        scrollTop: (17.8 * num)
                    }, 500);
                }
                setTimeout(() => {
                    dom = document.getElementsByClassName('CodeMirror-code');
                    lNum = angular.copy(num - parseInt(dom[0].children[0].innerText.split(' ')[0].split('↵')[0]) + 1);
                    if (vm.prevErrLine) {
                        dom[0].children[vm.prevErrLine - 1].classList.remove('bg-highlight');
                        let x = dom[0].children[vm.prevErrLine - 1];
                        x.getElementsByClassName('CodeMirror-gutter-elt')[0].classList.remove('text-danger');
                        x.getElementsByClassName('CodeMirror-gutter-elt')[0].classList.remove('bg-highlight');
                    }
                    if (dom[0].children[lNum - 1]) {
                        dom[0].children[lNum - 1].classList.add('bg-highlight');
                        let x = dom[0].children[lNum - 1];
                        x.getElementsByClassName('CodeMirror-gutter-elt')[0].classList.add('text-danger');
                        x.getElementsByClassName('CodeMirror-gutter-elt')[0].classList.add('bg-highlight');
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
                }, 0)
            });
        };

        function scrollTree(id, cb) {
            let dom = $('#' + id);
            let top;
            if (dom && dom.offset()) {
                if (dom.offset().top < 0) {
                    top = $('.tree-block')[0].scrollTopMax + dom.offset().top;
                } else {
                    top = dom.offset().top;
                }
                $('.tree-block').animate({
                    scrollTop: (top - 348)
                }, 500);
            } else {
                if (cb) {
                    cb();
                }
            }
        }

        function getParentToExpand(node, list) {
            if (node.parentId === list.uuid && list.parent == '#') {

            } else {
                if (list.nodes) {
                    for (let i = 0; i < list.nodes.length; i++) {
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
                    for (let i = 0; i < list.length; i++) {
                        if (node.parentId === list[i].uuid) {
                            if (!list[i].expanded) {
                                list[i].expanded = true;
                            }
                            getParentToExpand(list[i], vm.nodes[0]);
                        } else {
                            if (list[i].nodes) {
                                getParentToExpand(node, list[i].nodes);
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
                    } else if (((vm.errorName && vm.errorName.e !== node.ref) || !vm.errorName) && index == 0) {
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
            $('#centerPanel').addClass('m-l-0 fade-in');
            $('#centerPanel').find('.parent .child').removeClass('col-xxl-3 col-lg-4').addClass('col-xxl-2 col-lg-3');
            $('#xmlLeftSidePanel').hide();
            $('.sidebar-btn').show();
        };

        vm.showLeftPanel = function () {
            $('#centerPanel').removeClass('fade-in m-l-0');
            $('#centerPanel').find('.parent .child').addClass('col-xxl-3 col-lg-4').removeClass('col-xxl-2 col-lg-3');
            $('#xmlLeftSidePanel').show();
            $('.sidebar-btn').hide();
        };

        vm.setDropdownPosition = function (data, e) {
            $('[data-toggle="popover"]').popover('hide');
            const top = e.clientY + 8;
            const left = e.clientX - 20;
            if (window.innerHeight > top + (180 + ((vm.childNode.length > 10 ? 10 : vm.childNode.length) * 22))) {
                $('.list-dropdown').css({top: top + "px", left: left + "px", bottom: 'auto'})
                    .removeClass('arrow-down').addClass('dropdown-ac');
                let dom = $('#zoomCn');
                if (dom && dom.css('transform')) {
                    if (dom.css('transform') !== 'none') {
                        $('.list-dropdown').css({
                            '-webkit-transform': 'translateY(-' + (top - 120) + 'px)',
                            '-moz-transform': 'translateY(-' + (top - 120) + 'px)',
                            '-ms-transform': 'translateY(-' + (top - 120) + 'px)',
                            '-o-transform': 'translateY(-' + (top - 120) + 'px)',
                            'transform': 'translateY(-' + (top - 120) + 'px)'
                        })
                    }
                }
            } else {
                $('.list-dropdown').css({
                    top: "auto",
                    left: left + "px",
                    bottom: (window.innerHeight - top + 14) + "px"
                }).addClass('arrow-down').removeClass('dropdown-ac');
            }
        };

        $scope.$on('$destroy', function () {
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
