/**
 * Created by sourabhagrawal on 04/09/19.
 */
(function () {
    'use strict';
    angular
        .module('app')
        .controller('EditorConfigurationCtrl', EditorConfigurationCtrl)
        .controller('JOEEditorCtrl', JOEEditorCtrl)
        .controller('XMLEditorCtrl', XMLEditorCtrl);

    EditorConfigurationCtrl.$inject = ["$scope"];
    function EditorConfigurationCtrl($scope) {
        function calcHeight() {
            const dom = $('.scroll-y');
            let count = 0;
            if (dom && dom.position()) {
                function recursiveCheck (){
                    ++count;
                    let top = dom.position().top + 19;
                    const flag = top < 78;
                    top = top - $(window).scrollTop();
                    if (top < 96) {
                        top = 96;
                    }
                    $('.sticky').css('top', top);
                    $('.tree-block').height('calc(100vh - ' + (top + 24) + 'px' + ')');
                    if (count < 5) {
                        if (flag) {
                            recursiveCheck();
                        } else {
                            let intval = setInterval(function() {
                                recursiveCheck();
                                clearInterval(intval);
                            }, 150);
                        }
                    }
                }
                recursiveCheck();
            }
        }

        $scope.$on("$viewContentLoaded", function () {
            setTimeout(function() {
                calcHeight();
            },100);
        });
    }

    JOEEditorCtrl.$inject = ["$scope", "SOSAuth", "CoreService", "EditorService", "$location", "orderByFilter"];
    function JOEEditorCtrl($scope, SOSAuth, CoreService, EditorService, $location, orderBy) {
        var vm = $scope;
        vm.tree = [];
        vm.my_tree = {};
        vm.expanding_property = {
            field: "name"
        };


        function init() {
            EditorService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ["JOB"]
            }).then(function (res) {
                vm.tree = res.folders;
                angular.forEach(vm.tree, function (value) {
                    value.expanded = true;
                    if (value.folders) {
                        value.folders = orderBy(value.folders, 'name');
                    }
                });

            }, function () {

            });
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
        };
        vm.treeHandler1 = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }
        };

    }

    XMLEditorCtrl.$inject = ["$scope", "SOSAuth", "CoreService", "AuditLogService", "$location", "$http"];
    function XMLEditorCtrl($scope, SOSAuth, CoreService, AuditLogService, $location, $http) {
        var vm = $scope;
        vm.tree = [];
        vm.my_tree = {};
        vm.expanding_property = {
            field: "name"
        };
        vm.counting = 0;
        vm.autoAddCount = 0;
        vm.nodes = [];
        vm.childNode = [];
        vm.selectedXsd = '';
        vm.submitXsd = false;
        vm.isLoading = true;
        vm.validConfig = false;

        function ngOnInit() {
            if (sessionStorage.getItem('xsd') !== null) {
                if (sessionStorage.$SOS$XSD) {
                    vm.submitXsd = true;
                    vm.selectedXsd = sessionStorage.$SOS$XSD;
                }
                vm.reassignSchema();
                setTimeout(() => {
                    createJsonfromXml(sessionStorage.getItem('xsd'));
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
            console.log(vm.doc);
            getRootNode(vm.doc, check);
            vm.xsdXML = xml;
            console.log('.............stop 0.............')
            xpathFunc();
            console.log('.............stop 1.............')
            addKeyRefrencing();

            vm.selectedNode = vm.nodes[0];
            console.log('.............stop 2.............',vm.nodes)
            getData(vm.nodes[0]);
            vm.isLoading = !!check;
        }

        // submit xsd to open
        vm.submit = function() {
            if (vm.selectedXsd !== '') {
                sessionStorage.$SOS$XSD = vm.selectedXsd;
                vm.submitXsd = true;
                getInitTree(false);
            }
        };

        vm.reassignSchema = function() {
            vm.nodes = [];
            vm.isLoading = true;
            getInitTree(true);
        };

        // create json from xml
        function createJsonfromXml(data) {
            console.log('createJsonfromXml')
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
            console.log('createTempJson')
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
            mainjson.children = [];
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
            checkChildNode(mainjson);
            for (let i = 0; i < vm.childNode.length; i++) {
                if (a === vm.childNode[i].ref) {
                    vm.childNode[i].import = key;
                    addChild(vm.childNode[i], mainjson, false);
                }
            }
            for (let i = 0; i < mainjson.children.length; i++) {
                if (mainjson.children[i].ref == a && mainjson.children[i].import == key) {
                    createJsonAccToXsd(xmljson[rootNode], key, mainjson.children[i]);
                }
            }
        }

        // create json if xsd not matched
        function createNormalTreeJson(xmljson, rootNode, mainjson, parent) {
            let temp = {};
            getData(temp);
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
                    if (!mainjson.children) {
                        mainjson = Object.assign(mainjson, {children: []});
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
            mainjson.children.push(temp);
            for (let i = 0; i < mainjson.children.length; i++) {
                if (mainjson.children[i].ref === a && mainjson.children[i].import == key) {
                    createNormalTreeJson(xmljson[rootNode], key, mainjson.children[i], rootNode);
                }
            }
        }

        vm.removeTag = function(data) {
            if (data && data.data && data.data.match(/<[^>]+>/gm)) {
                let x = data.data.replace(/<[^>]+>/gm, '');
                x = x.replace('&nbsp;', ' ');
                return x;
            } else {
                return data.data;
            }
        }

        function addKeyRefrencing() {
            let key = {};
            if (vm.nodes[0] && vm.nodes[0].keyref) {
                for (let i = 0; i < vm.nodes[0].attributes.length; i++) {
                    if (vm.nodes[0].attributes[i].refer) {
                        key = Object.assign(key, {refe: vm.nodes[0].ref, name: vm.nodes[0].attributes[i].refer});
                        attachKeyRefrencing(key);
                        break;
                    }
                }
            } else {
                if (vm.nodes[0] && vm.nodes[0].children) {
                    for (let i = 0; i < vm.nodes[0].children.length; i++) {
                        addKeyRefrencingRecursion(vm.nodes[0].children[i]);
                    }
                }
            }
        }

        function addKeyRefrencingRecursion(child) {
            let key = {};
            if (child.keyref && child.attributes) {
                for (let i = 0; i < child.attributes.length; i++) {
                    if (child.attributes[i].refer) {
                        key = Object.assign(key, {refe: child.ref, name: child.attributes[i].refer});
                        attachKeyRefrencing(key);
                        if (child.children) {
                            for (let i = 0; i < child.children.length; i++) {
                                addKeyRefrencingRecursion(child.children[i]);
                            }
                        }
                        break;
                    }
                }
            } else {
                if (child && child.children) {
                    for (let i = 0; i < child.children.length; i++) {
                        addKeyRefrencingRecursion(child.children[i]);
                    }
                }
            }
        }

        function attachKeyRefrencing(key) {
            if (key.name) {
                if (vm.nodes[0].ref === key.name && vm.nodes[0].key) {
                    for (let i = 0; i < vm.nodes[0].attributes.length; i++) {
                        if (vm.nodes[0].attributes[i].name === vm.nodes[0].key) {
                            vm.nodes[0].attributes[i].refElement = key.refe;
                            break;
                        }
                    }
                } else {
                    for (let i = 0; i < vm.nodes[0].children.length; i++) {
                        attachKeyRefrencingRecursion(key, vm.nodes[0].children[i]);
                    }
                }
            }
        }

        function attachKeyRefrencingRecursion(key, child) {
            if (key.name) {
                if (child.ref === key.name && child.key && child.attributes) {
                    for (let i = 0; i < child.attributes.length; i++) {
                        if (child.attributes[i].name === child.key) {
                            child.attributes[i].refElement = key.refe;
                            break;
                        }
                    }
                } else {
                    for (let i = 0; i < child.children.length; i++) {
                        attachKeyRefrencingRecursion(key, child.children[i]);
                    }
                }
            }
        }

        function getRootNode(doc, check) {
            let temp, attrs, child;
            let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
            let rootElementPath = '//xs:element';
            let root = select(rootElementPath, doc);

            if(!root || !root[0]){
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
                child = checkChildNode(temp);
                if (child.length > 0) {
                    for (let i = 0; i < child.length; i++) {
                        if (child[i].minOccurs == undefined) {
                            if (!temp.children) {
                                temp.children = [];
                            }
                            addChild(child[i], temp, true);
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
            console.log(attrsArr, 'attrsArr');
            return attrsArr;
        }

        function checkChildNode(nodes) {
            let node = nodes.ref;
            let parentNode;
            vm.childNode = [];
            let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
            let complexTypePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType';
            let TypePath = '/xs:schema/xs:element[@name=\'' + node + '\']';
            let children = {};
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
                            children = {};
                            for (let j = 0; j < cElement[i].attributes.length; j++) {
                                let a = cElement[i].attributes[j].nodeName;
                                let b = cElement[i].attributes[j].nodeValue;
                                children = Object.assign(children, {[a]: b});
                            }
                            children.parent = node;
                            childArr.push(children);
                            vm.childNode = childArr;
                        }
                    }
                    let dPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:choice/xs:element';
                    let dElement = select(dPath, vm.doc);
                    if (dElement.length > 0) {
                        for (let i = 0; i < dElement.length; i++) {
                            children = {};
                            for (let j = 0; j < dElement[i].attributes.length; j++) {
                                let a = dElement[i].attributes[j].nodeName;
                                let b = dElement[i].attributes[j].nodeValue;
                                children = Object.assign(children, {[a]: b});
                            }
                            children.parent = node;
                            children.choice = node;
                            childArr.push(children);
                            vm.childNode = childArr;
                        }
                    }
                    let ePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:choice/xs:sequence/xs:element';
                    let eElement = select(ePath, vm.doc);
                    if (eElement.length > 0) {
                        for (let i = 0; i < eElement.length; i++) {
                            children = {};
                            for (let j = 0; j < eElement[i].attributes.length; j++) {
                                let a = eElement[i].attributes[j].nodeName;
                                let b = eElement[i].attributes[j].nodeValue;
                                children = Object.assign(children, {[a]: b});
                            }
                            children.parent = node;
                            children.choice = node;
                            if (children.minOccurs && !children.maxOccurs) {
                            } else {
                                childArr.push(children);
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
                            children = {};
                            for (let j = 0; j < childs1[i].attributes.length; j++) {
                                let a = childs1[i].attributes[j].nodeName;
                                let b = childs1[i].attributes[j].nodeValue;
                                children = Object.assign(children, {[a]: b});
                            }
                            children.parent = node;
                            children.choice = node;
                            childArr.push(children);
                            vm.childNode = childArr;
                        }
                        let childPath2 = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:choice/xs:sequence/xs:element';
                        let child12 = select(childPath2, vm.doc);
                        if (child12.length > 0) {
                            for (let i = 0; i < child12.length; i++) {
                                children = {};
                                for (let j = 0; j < child12[i].attributes.length; j++) {
                                    let a = child12[i].attributes[j].nodeName;
                                    let b = child12[i].attributes[j].nodeValue;
                                    children = Object.assign(children, {[a]: b});
                                }
                                children.parent = node;
                                children.choice = node;
                                childArr.push(children);
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
                                children = {};
                                for (let j = 0; j < sElement[i].attributes.length; j++) {
                                    let a = sElement[i].attributes[j].nodeName;
                                    let b = sElement[i].attributes[j].nodeValue;
                                    children = Object.assign(children, {[a]: b});
                                }
                                children.parent = node;
                                childArr.push(children);
                                vm.childNode = childArr;
                            }
                        } else if ((select(complexContentWithElementPath, vm.doc)).length > 0) {
                            let childrenPath1 = '/xs:schema/xs:complexType[@name=\'' + childs[0].nodeValue + '\']/xs:choice/xs:element';
                            let elementx = select(childrenPath1, vm.doc);
                            if (elementx.length > 0) {
                                for (let i = 0; i < elementx.length; i++) {
                                    children = {};
                                    for (let j = 0; j < elementx[i].attributes.length; j++) {
                                        let a = elementx[i].attributes[j].nodeName;
                                        let b = elementx[i].attributes[j].nodeValue;
                                        children = Object.assign(children, {[a]: b});
                                    }
                                    children.parent = node;
                                    children.choice = node;
                                    childArr.push(children);
                                    vm.childNode = childArr;
                                }
                                let ele = select(complexContentWithElementPath, vm.doc);
                                for (let i = 0; i < ele.length; i++) {
                                    children = {};
                                    for (let j = 0; j < ele[i].attributes.length; j++) {
                                        let a = ele[i].attributes[j].nodeName;
                                        let b = ele[i].attributes[j].nodeValue;
                                        children = Object.assign(children, {[a]: b});
                                    }
                                    children.parent = node;
                                    childArr.push(children);
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
                            nodes = Object.assign(nodes, {values: []});
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
                            nodes.values.push(temp);
                        }
                    }
                }
            }
        }

        function addTypeChildNode(node, parent) {
            var parentNode;
            let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
            let complexTypePath = '/xs:schema/xs:complexType[@name=\'' + node + '\']';
            let TypePath = '/xs:schema/xs:element[@name=\'' + node + '\']';
            let children = {};
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
                            children = {};
                            for (let j = 0; j < childs[i].attributes.length; j++) {
                                let a = childs[i].attributes[j].nodeName;
                                let b = childs[i].attributes[j].nodeValue;
                                children = Object.assign(children, {[a]: b});
                            }
                            children.parent = parent;
                            childArr.push(children);
                            vm.childNode = childArr;
                        }
                    }
                    let seqChoicePath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence/xs:choice/xs:element';
                    let getChildChoice = select(seqChoicePath, vm.doc);
                    if (getChildChoice.length > 0) {
                        for (let i = 0; i < getChildChoice.length; i++) {
                            children = {};
                            for (let j = 0; j < getChildChoice[i].attributes.length; j++) {
                                let a = getChildChoice[i].attributes[j].nodeName;
                                let b = getChildChoice[i].attributes[j].nodeValue;
                                children = Object.assign(children, {[a]: b});
                            }
                            children.parent = parent;
                            children.choice = parent;
                            childArr.push(children);
                            vm.childNode = childArr;
                        }
                    }
                    let seqChoiceSeqPath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence/xs:choice/xs:sequence/xs:element';
                    let getChildChoiceSeq = select(seqChoiceSeqPath, vm.doc);
                    if (getChildChoiceSeq.length > 0) {
                        for (let i = 0; i < getChildChoiceSeq.length; i++) {
                            children = {};
                            for (let j = 0; j < getChildChoiceSeq[i].attributes.length; j++) {
                                let a = getChildChoiceSeq[i].attributes[j].nodeName;
                                let b = getChildChoiceSeq[i].attributes[j].nodeValue;
                                children = Object.assign(children, {[a]: b});
                            }
                            children.parent = parent;
                            children.choice1 = parent;
                            childArr.push(children);
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
                            children = {};
                            for (let j = 0; j < childs[i].attributes.length; j++) {
                                let a = childs[i].attributes[j].nodeName;
                                let b = childs[i].attributes[j].nodeValue;
                                children = Object.assign(children, {[a]: b});
                            }
                            children.parent = parent;
                            children.choice = parent;
                            childArr.push(children);
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

        function addChild(child, nodeArr, check) {
            let attrs = checkAttributes(child.ref);
            let text = checkText(child.ref);
            let value = getValues(child.ref);
            let attrsType = getAttrFromType(child.ref, child.parent);
            let valueType = getValueFromType(child.ref, child.parent);
            let val = getVal(child);
            if ((_.isEmpty(val)) && (_.isEmpty(value)) && (_.isEmpty(valueType))) {
                val = getValFromDefault(child);
            }
            child.children = [];
            child.uuid = vm.counting;
            child.parentId = nodeArr.uuid;
            vm.counting++;
            if (!(_.isEmpty(attrs))) {
                attachAttrs(attrs, child);
            }
            nodeArr.children.push(child);
            if (check) {
                autoAddChild(child);
            }
            if (!(_.isEmpty(text))) {
                addText(text, nodeArr.children);
            }
            if (!(_.isEmpty(val))) {
                attachValue(val, nodeArr.children);
            }
            if (!(_.isEmpty(value))) {
                attachValue(value, nodeArr.children);
            }
            if (valueType !== undefined) {
                attachValue(valueType, nodeArr.children);
            }
            if (attrsType !== undefined) {
                attachTypeAttrs(attrsType, nodeArr.children);
            }
            if (nodeArr.ref === 'NotificationMail' || nodeArr.ref === 'Header') {
                arrangeArr(nodeArr);
            }

            autoExpand(nodeArr);
            printArraya(false);
        }

        function autoAddChild(child) {
            if (vm.autoAddCount === 0) {
                let getCh = checkChildNode(child);
                if (getCh) {
                    for (let i = 0; i < getCh.length; i++) {
                        if (getCh[i].minOccurs == undefined || getCh[i].minOccurs == 1) {
                            if (!getCh[i].choice) {
                                getCh[i].children = [];
                                vm.autoAddCount++;
                                addChild(getCh[i], child, true);
                            }
                        }
                    }
                }
                getData(child);
                printArraya(false);
            }
        }

        // to send data in details component
        function getData(event) {
            setTimeout(() => {
                calcHeight();
            }, 1);
            console.log(event, ' getData')
            if (event && event.keyref) {
                for (let i = 0; i < event.attributes.length; i++) {
                    if (event.attributes[i].name === event.keyref) {
                        getDataAttr(event.attributes[i].refer);
                        break;
                    }
                }
            }
            vm.selectedNode = event;
            vm.breadCrumbArray = [];
            if(event) {
                createBreadCrumb(event);
            }
            vm.breadCrumbArray.reverse();
        }

        function getDataAttr(refer) {
            vm.tempArr = [];
            let temp;
            getKeyRecursively(refer, vm.nodes[0].children);
        }

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
                    if (vm.nodes[0].children[i] && vm.nodes[0].children[i].children) {
                        getKeyRecursively(refer, childNode[i].children);
                    }
                }
            }
        }

        // BreadCrumb
        function createBreadCrumb(node) {
            if (vm.nodes[0] && vm.nodes[0].ref === node.parent && vm.nodes[0].uuid === node.parentId) {
                vm.breadCrumbArray.push(vm.nodes[0]);
            } else {
                if (vm.nodes[0] && vm.nodes[0].children && vm.nodes[0].children.length > 0) {
                    for (let i = 0; i < vm.nodes[0].children.length; i++) {
                        createBreadCrumbRecursively(node, vm.nodes[0].children[i]);
                    }
                }
            }
        }

        function createBreadCrumbRecursively(node, nodes) {
            if (nodes && nodes.ref === node.parent && nodes.uuid === node.parentId) {
                vm.breadCrumbArray.push(nodes);
                createBreadCrumb(nodes);
            } else {
                if (nodes.children && nodes.children.length > 0) {
                    for (let i = 0; i < nodes.children.length; i++) {
                        createBreadCrumbRecursively(node, nodes.children[i]);
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
                let x;
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
            let arr = _.clone(node.children);
            for (let j = 0; j < arr.length; j++) {
                if (node.children[j].ref === 'From') {
                    let temp;
                    if (node && node.children[0] !== undefined) {
                        temp = node.children[0];
                        node.children[0] = node.children[j];
                        node.children[j] = temp;
                    }
                }
                if (node.children[j].ref === 'To') {
                    let temp;
                    if (node && node.children[1] !== undefined) {
                        temp = node.children[1];
                        node.children[1] = node.children[j];
                        node.children[j] = temp;
                    }
                }
                if (node.children[j].ref === 'CC') {
                    let temp;
                    if (node && node.children[2] !== undefined) {
                        temp = node.children[2];
                        node.children[2] = node.children[j];
                        node.children[j] = temp;
                    }
                }
                if (node.children[j].ref === 'BCC') {
                    let temp;
                    if (node && node.children[3] !== undefined) {
                        temp = node.children[3];
                        node.children[3] = node.children[j];
                        node.children[j] = temp;
                    }
                }
                if (node.children[j].ref === 'Subject' && j < node.children[j].length) {
                    let temp;
                    if (node && node.children[4] !== undefined) {
                        temp = node.children[4];
                        node.children[4] = node.children[j];
                        node.children[j] = temp;
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
            if (vm.nodes[0] && vm.nodes[0].children) {
                for (let i = 0; i < vm.nodes[0].children.length; i++) {
                    if (vm.nodes[0].children[i].ref === nodes.name) {
                        if (k) {
                            vm.nodes[0].children[i].key = nodes.key;
                        } else if (keyre) {
                            vm.nodes[0].children[i].keyref = nodes.keyref;
                        }
                    } else {
                        if (vm.nodes[0].children[i].children) {
                            recursion(nodes, vm.nodes[0].children[i].children);
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
                        if (child[i].children) {
                            recursion(_nodes, child[i].children);
                        }

                    }
                }
            }
        }

        // Expand automatically on add children
        function autoExpand(exNode) {
            console.log(exNode)
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
            if (vm.nodes[0].children && vm.nodes[0].children.length > 0) {
                for (let i = 0; i < vm.nodes[0].children.length; i++) {
                    createChildJson(peopleElem, vm.nodes[0].children[i], doc.createElement(vm.nodes[0].children[i].ref), doc);
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
            if (childrenNode.children && childrenNode.children.length > 0) {
                for (let i = 0; i < childrenNode.children.length; i++) {
                    createChildJson(curentNode, childrenNode.children[i], doc.createElement(childrenNode.children[i].ref), doc);
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
        vm.autoValidate = function() {
            if (vm.nodes[0] && vm.nodes[0].attributes && vm.nodes[0].attributes.length > 0) {
                for (let i = 0; i < vm.nodes[0].attributes.length; i++) {
                    if (vm.nodes[0].attributes[i].use === 'required') {
                        if (vm.nodes[0].attributes[i].data === undefined) {
                            vm.nonValidattribute = vm.nodes[0].attributes[i];
                            vm.errorLocation = vm.nodes[0];
                            vm.validConfig = false;
                            return false;
                        }
                    }
                }
            }
            if (vm.nodes[0] && vm.nodes[0].values && vm.nodes[0].values.length > 0) {
                if (vm.nodes[0].values[0].data === undefined) {
                    vm.nonValidattribute = vm.nodes[0].values[0];
                    vm.errorLocation = vm.nodes[0];
                    vm.validConfig = false;
                    return false;
                }
            }
            if (vm.nodes[0] && vm.nodes[0].children && vm.nodes[0].children.length > 0) {
                for (let i = 0; i < vm.nodes[0].children.length; i++) {
                    let x = autoValidateRecursion(vm.nodes[0].children[i]);
                    if (x == false) {
                        return x;
                    }
                }
            }
            vm.nonValidattribute = {};
        };

        function autoValidateRecursion (child) {
            if (child && child.attributes && child.attributes.length > 0) {
                for (let i = 0; i < child.attributes.length; i++) {
                    if (child.attributes[i].use === 'required') {
                        if (child.attributes[i].data === undefined) {
                            vm.nonValidattribute = child.attributes[i];
                            vm.errorLocation = child;
                            vm.validConfig = false;
                            return false;
                        }
                    }
                }
            }
            if (child && child.values && child.values.length > 0) {
                if (child.values[0].data === undefined) {
                    vm.nonValidattribute = child.values[0];
                    vm.errorLocation = child;
                    vm.validConfig = false;
                    return false;
                }
            }
            if (child && child.children && child.children.length > 0) {
                for (let i = 0; i < child.children.length; i++) {
                    let x = autoValidateRecursion(child.children[i]);
                    if (x == false) {
                        return x;
                    }
                }
            }
        }

    }
})();
