/**
 * Created by sourabhagrawal on 04/09/19.
 */
(function () {
    'use strict';
    angular
        .module('app')
        .controller('EditorConfigurationCtrl', EditorConfigurationCtrl)
        .controller('JOEEditorCtrl', JOEEditorCtrl)
        .controller('XMLEditorCtrl', XMLEditorCtrl)
        .controller('JobEditorCtrl', JobEditorCtrl)
        .controller('JobChainEditorCtrl', JobChainEditorCtrl)
        .controller('OrderEditorCtrl', OrderEditorCtrl)
        .controller('ScheduleEditorCtrl', ScheduleEditorCtrl)
        .controller('ProcessClassEditorCtrl', ProcessClassEditorCtrl)
        .controller('LockEditorCtrl', LockEditorCtrl);

    EditorConfigurationCtrl.$inject = ["$scope", "$rootScope", "$state"];
    function EditorConfigurationCtrl($scope, $rootScope, $state) {
        $scope.validConfig = false;

        $scope.changeValidConfigStatus = function (status) {
            $scope.validConfig = status;
        };

        function calcHeight() {
            const dom = $('.scroll-y');
            let count = 0;
            if (dom && dom.position()) {
                function recursiveCheck() {
                    ++count;
                    let top = dom.position().top + 19;
                    const flag = top < 78;
                    top = top - $(window).scrollTop();
                    $('.scroll-y').css({'height': 'calc(100vh - ' + top + 'px'})
                    if (top < 96) {
                        top = 96;
                    }
                    $('.sticky').css('top', top);
                    $('.tree-block').height('calc(100vh - ' + (top + 2) + 'px' + ')');
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

        $scope.$on("$viewContentLoaded", function () {
            $scope.currentTab = $state.current.url;
            setTimeout(function () {
                calcHeight();
            }, 100);
        });
    }

    JOEEditorCtrl.$inject = ["$scope", "SOSAuth", "CoreService", "EditorService"];
    function JOEEditorCtrl($scope, SOSAuth, CoreService, EditorService) {
        const vm = $scope;

        vm.tree = [];
        vm.my_tree = {};
        vm.expanding_property = {
            field: "name"
        };

        vm.type = 'JOB';

        function init() {
            EditorService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ["JOB"]
            }).then(function (res) {
                vm.tree = res.folders;
                if (vm.tree.length > 0) {
                    vm.tree[0].expanded = true;
                    updateObjects(vm.tree[0]);
                }
                /* angular.forEach(vm.tree, function (value) {
                     value.expanded = true;
                     if (value.folders) {
                         value.folders = orderBy(value.folders, 'name');
                     }
                     updateObjects(value);

               });*/
            }, function () {

            });
        }

        function updateObjects(data) {
            if (!data.folders) {
                data.folders = [];
            }
            let arr = [{
                name: 'Jobs',
                path: data.path + '/Jobs',
                object: 'Jobs',
                children: [{name: 'Job1', type: 'job'}, {name: 'Job2', type: 'job'}]
            },
                {name: 'Job Chains', path: data.path + '/Job_Chains', object: 'Job Chains', children: []},
                {name: 'Orders', path: data.path + '/Orders', object: 'Orders', children: []},
                {
                    name: 'Process Classes',
                    path: data.path + '/Process+Classes',
                    object: 'Process Classes',
                    children: []
                },
                {name: 'Schedules', path: data.path + '/Schedules', object: 'Schedules', children: []},
                {name: 'Locks', path: data.path + '/Locks', object: 'Locks', children: []},
                {
                    name: 'Pre/Post Processing',
                    path: data.path + '/Pre/Post_Processing',
                    object: 'Pre/Post Processing',
                    children: []
                }];

            data.folders = arr.concat(data.folders);
            if (data.folders) {
                for (let i = 0; i < data.folders.length; i++) {
                    if (!data.folders[i].object)
                        updateObjects(data.folders[i]);
                }
            }
        }

        init();

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

        vm.treeHandler = function (data) {
            if (vm.userPreferences.expandOption === 'both')
                data.expanded = true;
            navFullTree();
            data.selected1 = true;
            vm.type = data.object === 'Jobs' ? 'JOB' : data.object === 'Job Chains' ? 'JOBCHAIN' : data.object === 'Orders' ? 'ORDER' :
                data.object === 'Schedules' ? 'SCHEDULE' : data.object === 'Process Classes' ? 'PROCESSCLASS' : 'LOCK';
            
        };
        vm.treeHandler1 = function (data) {
/*            if (data.expanded) {
               data.folders = orderBy(data.folders, 'name');
            }*/
        };

    }

    XMLEditorCtrl.$inject = ["$scope", "SOSAuth", "CoreService", "AuditLogService", "$location", "$http", "$uibModal", "gettextCatalog", "toasty", "FileUploader", "$sce"];

    function XMLEditorCtrl($scope, SOSAuth, CoreService, AuditLogService, $location, $http, $uibModal, gettextCatalog, toasty, FileUploader, $sce) {
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

        vm.treeOptions = {
            beforeDrop : function (e) {
                let sourceValue = e.source.nodeScope.$modelValue,
                    destValue = e.dest.nodesScope.node ? e.dest.nodesScope.node : undefined;
                return dragAnddropRules(sourceValue, destValue);
            }
        };

        var uploader = $scope.uploader = new FileUploader({
            url: '',
            alias: 'file'
        });

        // CALLBACKS
        uploader.onAfterAddingFile = function (item) {
            let fileExt = item.file.name.slice(item.file.name.lastIndexOf('.') + 1).toUpperCase();
            if (fileExt != 'XML') {
                toasty.error({
                    title: gettextCatalog.getString("message.invalidFileExtension"),
                    timeout: 10000
                });
                item.remove();
            } else {
                vm.fileLoading = true;
                let reader = new FileReader();
                reader.readAsText(item._file, "UTF-8");
                reader.onload = onLoadFile;
            }
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
            if (sessionStorage.getItem('xsd') !== null) {
                if (sessionStorage.$SOS$XSD) {
                    vm.submitXsd = true;
                    vm.selectedXsd = sessionStorage.$SOS$XSD;
                }
                vm.reassignSchema();
                setTimeout(() => {
                    createJSONFromXML(sessionStorage.getItem('xsd'));
                }, 600);
            } else {
                if (sessionStorage.$SOS$XSD) {
                    vm.submitXsd = true;
                    vm.selectedXsd = sessionStorage.$SOS$XSD;
                    getInitTree(false);
                } else {
                    vm.isLoading = false;
                }
            }
        }

        ngOnInit();

        // getInit tree
        function getInitTree(check) {
            if (vm.selectedXsd === 'systemMonitorNotification') {
                $http.get('xsd/SystemMonitorNotification_v1.0.xsd')
                    .then(function (data) {
                        loadTree(data.data, check);
                    });
            } else if (vm.selectedXsd === 'yade') {
                $http.get('xsd/yade_v1.12.xsd')
                    .then(function (data) {
                        loadTree(data.data, check);
                    });
            } else {
                $http.get('xsd/' + vm.selectedXsd + '.xsd')
                    .then(function (data) {
                        loadTree(data.data, check);
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
        vm.submit = function () {
            if (vm.selectedXsd !== '') {
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

        vm.removeCkCss = function(id) {
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

                let textAttrsPath1 = '/xs:schema/xs:element[@name=\'' + node.parent + '\']/xs:complexType/xs:complexContent/xs:extension/xs:attribute[@name=\'' + node.name + '\']/xs:annotation/xs:documentation';
                text.doc = select(textAttrsPath1, vm.doc);
                node.text = text;
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

        vm.checkChildNode = function(_nodes) {
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

        vm.addChild = function(child, nodeArr, check) {
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
                        getDataAttr(evt.attributes[i].refer);
                        break;
                    }
                }
            }

            if(evt.ref === 'Body') {
                setTimeout(function () {
                    initEditor(evt);
                }, 10);
            }
            vm.selectedNode = evt;
            vm.breadCrumbArray = [];
            if (evt) {
                createBreadCrumb(evt);
            }
            vm.breadCrumbArray.reverse();
        };

        function getDataAttr(refer) {
            vm.tempArr = [];
            getKeyRecursively(refer, vm.nodes[0].nodes);
        }

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
                    if (key === 'uuid') {
                        vm.copyItem = Object.assign({}, vm.copyItem, {[key]: vm.counting});
                        vm.counting++;
                    } else {
                        vm.copyItem = Object.assign({}, vm.copyItem, {[key]: node[key]});
                    }
                }
            }
        }

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
                    if (key === 'uuid') {
                        tempa = Object.assign({}, tempa, {[key]: vm.counting});
                        vm.counting++;
                    } else {
                        tempa = Object.assign({}, tempa, {[key]: node[key]});
                    }
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
                sessionStorage.setItem('xsd', a);
            } else {
                sessionStorage.removeItem('xsd');
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

        // validation for attributes
        vm.validateAttr = function (value, tag) {
            if (tag.type === 'xs:NMTOKEN') {
                if (/\s/.test(value)) {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.spaceNotAllowed');
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
            } else if(tag.type === 'xs:integer'){                
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
            }else {
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
                                delete tag[key];
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
            } else if(tag.type === 'xs:integer'){                
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
                message: msg,
                timeout: 10000
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
            node.str = (node.text.doc && node.text.doc[0]) ? $sce.trustAsHtml(node.text.doc[0].innerHTML) : '';
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
            node.nodes.push(vm.copyItem);
            vm.cutData = false;
            vm.checkRule = true;
            printArraya(false);
        };

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
            vm.tooltipAttrData = '';
            if (node.attributes) {
                for (let i = 0; i < node.attributes.length; i++) {
                    if (node.attributes[i].data) {
                        let temp = node.attributes[i].name;
                        temp = temp + ' = ';
                        temp = temp + node.attributes[i].data;
                        if (node.attributes.length - 1 === i) {
                            vm.tooltipAttrData = vm.tooltipAttrData + temp;
                        } else {
                            vm.tooltipAttrData = vm.tooltipAttrData + temp + ' | ';
                        }
                    }
                }
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
                $scope.changeValidConfigStatus(true);
                toasty.success({
                    title: 'Element : ' + vm.nodes[0].ref,
                    message: 'XML is valid'
                });

            } else {
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
                if (res === 'yes') {
                    save();
                } else {
                    vm.nodes = [];
                    vm.selectedNode = [];
                }
                vm.submitXsd = false;
                sessionStorage.removeItem('$SOS$XSD');
                sessionStorage.removeItem('xsd');
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
                        items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo']
                    },
                    {name: 'editing', items: ['Find', 'Replace', '-']},
                    {
                        name: 'basicstyles',
                        items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat']
                    },
                    '/',
                    {
                        name: 'paragraph',
                        items: ['NumberedList', 'BulletedList', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl']
                    },
                    {name: 'links', items: ['Link', 'Unlink', 'Anchor']},
                    {name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize']},
                    {name: 'colors', items: ['TextColor', 'BGColor']},
                ],
                bodyClass: vm.userPreferences.theme !== 'light' && vm.userPreferences.theme !== 'lighter' || !vm.userPreferences.theme ? 'white_text' : 'dark_text',
            });

            vm.ckEditor.on('change', function() {
                vm.myContent = vm.ckEditor.getData();
                parseEditorText(vm.myContent, vm.selectedNode);
            });
        }

        function parseEditorText (evn, nodes) {
            if (evn.match(/<[^>]+>/gm)) {
                let x = evn.replace(/<[^>]+>/gm);
                if (x !== 'undefined&nbsp;undefined') {
                    nodes.values[0] = Object.assign(nodes.values[0], {data: evn});
                    vm.myContent = nodes.values[0].data;
                    vm.error = false;
                } else {
                    delete nodes.values[0].data;
                }
            }
        }

        // Show all Child Nodes and search functionalities.
        vm.showAllChildNode = function(node) {
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

        window.addEventListener("beforeunload", function () {
            autoSave();
            return true;
        });

        vm.$on('$destroy', function () {
            autoSave();
        });


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

    JobEditorCtrl.$inject = ["$scope", "$rootScope"];
    function JobEditorCtrl($scope, $rootScope) {
        const vm = $scope;
        vm.filter = {'sortBy': 'name', sortReverse: false};
        vm.jobs = [];
        vm.languages = ['shell', 'java', 'dotnet', 'java:javascript', "perlScript", "powershell", "VBScript", "scriptcontrol:vbscript", "javax.script:rhino", "javax.script:ecmascript", "javascript"];
        vm.logLevelValue = ['info', 'debug1', 'debug2', 'debug3', 'debug4', 'debug5', 'debug6', 'debug7', 'debug8', 'debug9'];
        vm.stdErrLogLevelValue = ['info', 'Error'];
        vm.histroyOnProcessValue = [0,1,2,3,4];
        vm.histroyWithLogValue = ['yes', 'no', 'gzip'];
        vm.ignoreSignalsValue = ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGHTRAP', 'SIGABRT', 'SIGIOT', 'SIGBUS', 'SIGFPE', 'SIGKILL', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGALRM', 'SIGTERM', 'SIGSTKFLT', 'SIGCHLD', 'SIGCONT', 'SIGSTOP', 'SIGTSTP', 'SIGTTIN', 'SIGTTOU', 'SIGURG', 'SIGXCPU', 'SIGXFSZ', 'SIGVTALRM', 'SIGPROF', 'SIGWINCH', 'SIGPOLL', 'SIGIO', 'SIGPWR', 'SIGSYS']
        vm.priorityValue = ['idle', 'below normal', 'normal', 'above normal', 'high'];
        vm.visibleValue = ['yes', 'no', 'never'];
        vm.createStandaloneJob = function () {
            vm.job = {
                name: 'Job1',
                order: 'No',
                language: 'shell'
            };
        };

        vm.createOrderJob = function () {
            vm.job = {
                name: 'Job1',
                order: 'Yes',
                language: 'shell'
            };
        };
    }

    JobChainEditorCtrl.$inject = ["$scope", "$rootScope"];
    function JobChainEditorCtrl($scope, $rootScope) {

    }

    OrderEditorCtrl.$inject = ["$scope", "$rootScope"];
    function OrderEditorCtrl($scope, $rootScope) {

    }

    ScheduleEditorCtrl.$inject = ["$scope", "$rootScope"];
    function ScheduleEditorCtrl($scope, $rootScope) {

    }

    ProcessClassEditorCtrl.$inject = ["$scope", "$rootScope"];
    function ProcessClassEditorCtrl($scope, $rootScope) {

    }

    LockEditorCtrl.$inject = ["$scope", "$rootScope"];
    function LockEditorCtrl($scope, $rootScope) {
        const vm = $scope;
        vm.filter = {'sortBy': 'name', sortReverse: false};
        vm.locks = [];

        vm.createLock = function () {
            vm.lock = {
                name: 'Lock1',
                maxNonExclusive: true,
                nonExclusive: 0
            };
        };

        vm.cancel = function(){
            vm.lock = undefined;
        };
    }
})();
