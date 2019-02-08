import {Component, HostListener, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CoreService} from '../../../services/core.service';
import {HttpClient} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import {ToasterService} from 'angular2-toaster';
import {saveAs} from 'file-saver';
import * as _ from 'underscore';
import {FileUploader} from 'ng2-file-upload';
import {TreeModel, TreeNode} from 'angular-tree-component';

declare const require;
declare const vkbeautify;
declare const $;

const xpath = require('xpath');
const convert = require('xml-js');
const xmldom = require('xmldom');

@Component({
  selector: 'app-xml',
  templateUrl: './xml-editor.component.html',
  styleUrls: ['./xml-editor.component.scss']
})
export class XmlEditorComponent implements OnInit {
  schedulerIds: any = {};
  preferences: any = {};
  isLoading = true;
  options: any = {};
  doc: any;
  nodes: any = [];
  sat;
  tooltipAttrData: any;
  showAllChild: any = [];
  innerTreeStruc: any = [];
  counter = 0;
  xml: any;
  xsdXML: any;
  isNext = false;
  counting = 0;
  autoAddCount = 0;
  copyItem: any = {};
  cutData = false;
  checkRule = true;
  choice = true;
  dragFrom: any;
  dragTo: any;
  dropCheck = false;
  selectedNode: any;
  selectedXsd = '';
  submitXsd = false;
  validXml: any;
  fileLoading = true;
  submitted;
  selectedXMLFile: any;
  uploadData;
  dataLoad = false;
  assignXsd = false;
  errorLocation: any;
  showAllChildTree: any = [];
  childNode: any = [];
  myContent: string;
  value: any = [];
  count = 1;
  error = false;
  errorName;
  tempArr: any = [];
  ckeConfig: any;
  text;
  sData: string;
  uploader: FileUploader;

  @ViewChild('treeCtrl') treeCtrl;
  @ViewChild('myckeditor') ckeditor: any;
  @ViewChild('uploadModelClose') uploadModelClose: ElementRef;

  constructor(private http: HttpClient, public coreService: CoreService, public translate: TranslateService, public toasterService: ToasterService) {
    this.uploader = new FileUploader({url: ''});
    this.ckeConfig = {
      allowedContent: false,
      forcePasteAsPlainText: true
    };
  }

  ngOnInit() {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    console.log(sessionStorage.$SOS$XSD);
    if (sessionStorage.$SOS$XSD) {
      this.submitXsd = true;
      this.selectedXsd = sessionStorage.$SOS$XSD;
      this.getInitTree();
    } else {
      this.isLoading = false;
    }
  }

  navFullTree() {
    const self = this;
    this.nodes.forEach((value) => {
      value.isSelected = false;
      traverseTree(value);
    });

    function traverseTree(data) {
      data.children.forEach((value) => {
        value.isSelected = false;
        traverseTree(value);
      });
    }
  }

  onNodeSelected(e): void {
    this.navFullTree();
    e.node.data.isSelected = true;
  }

  toggleExpanded(e): void {
    e.node.data.isExpanded = e.isExpanded;
  }

  // Expand all Node
  expandAll(): void {
    this.treeCtrl.treeModel.expandAll();
  }

  // Collapse all Node
  collapseAll(): void {
    this.treeCtrl.treeModel.collapseAll();
  }

  // change selected xsd value
  changeXSD(value) {
    this.selectedXsd = value;
    sessionStorage.$SOS$XSD = value;
  }

  // submit xsd to open
  submit() {
    if (this.selectedXsd !== '') {
      this.submitXsd = true;
      this.getInitTree();
    }
  }

  // getInit tree
  getInitTree() {
    if (this.selectedXsd == 'systemMonitorNotification') {
      this.http.get('SystemMonitorNotification_v1.0.main.xsd', {responseType: 'text'})
        .subscribe(data => {
          this.loadTree(data);
        });
    } else {
      this.http.get('yade_v1.12.xsd', {responseType: 'text'})
        .subscribe(data => {
          this.loadTree(data);
        });
    }
  }

  loadTree(xml) {
    this.isLoading = false;
    const DOMParser = xmldom.DOMParser;
    this.doc = new DOMParser().parseFromString(xml, 'application/xml');
    this.getRootNode(this.doc);
    this.xsdXML = xml;
    this.xpath();
    this.AddKeyRefrencing();
    this.selectedNode = this.nodes[0];
  }

  reassignSchema() {
    this.getInitTree();
  }

  getRootNode(doc) {
    let temp: any;
    let attrs: any;
    let child: any;
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let rootElementPath = '//xs:element';
    let root = select(rootElementPath, doc);
    for (let i = 0; i < root[0].attributes.length; i++) {
      let b = root[0].attributes[i].nodeValue;
      temp = Object.assign({}, {ref: b});
    }
    temp.parent = '#';
    temp.uuid = this.counting;
    this.counting++;
    attrs = this.checkAttributes(temp.ref);
    if (attrs.length > 0) {
      temp.attributes = [];
      for (let i = 0; i < attrs.length; i++) {
        this.checkAttrsText(attrs[i]);
        attrs[i].id = this.counting;
        this.counting++;
        temp.attributes.push(attrs[i]);
      }
    }
    let text = this.checkText(temp.ref);
    if (text) {
      temp.text = text;
    }
    child = this.checkChildNode(temp);
    if (child.length > 0) {
      for (let i = 0; i < child.length; i++) {
        if (child[i].minOccurs == undefined) {
          if (!temp.children) {
            temp.children = [];
          }
          this.addChild(child[i], temp);
        }
      }
    }
    this.printArray(temp);
  }

  checkAttributes(node) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let complexTypePath = '//xs:element[@name=\'' + node + '\']/xs:complexType';
    let attribute: any = {};
    let attrsArr: any = [];
    let element = select(complexTypePath, this.doc);
    if (element.length > 0) {
      let attrsPath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:attribute';
      let attrs = select(attrsPath, this.doc);
      if (attrs.length > 0) {
        for (let i = 0; i < attrs.length; i++) {
          attribute = {};
          for (let j = 0; j < attrs[i].attributes.length; j++) {
            let a = attrs[i].attributes[j].nodeName;
            let b = attrs[i].attributes[j].nodeValue;
            attribute = Object.assign(attribute, {[a]: b});
          }
          attribute.parent = node;
          attrsArr.push(attribute);
        }
      }
    }
    if (element.length > 0) {
      let attrsPath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:complexContent/xs:extension/xs:attribute';
      let attrs = select(attrsPath, this.doc);
      if (attrs.length > 0) {
        for (let i = 0; i < attrs.length; i++) {
          attribute = {};
          for (let j = 0; j < attrs[i].attributes.length; j++) {
            let a = attrs[i].attributes[j].nodeName;
            let b = attrs[i].attributes[j].nodeValue;
            attribute = Object.assign(attribute, {[a]: b});
          }
          attribute.parent = node;
          attrsArr.push(attribute);
        }
      }
    }

    if (element.length > 0) {
      let attrsPath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:simpleContent/xs:extension/xs:attribute';
      let attrs = select(attrsPath, this.doc);
      if (attrs.length > 0) {
        for (let i = 0; i < attrs.length; i++) {
          attribute = {};
          for (let j = 0; j < attrs[i].attributes.length; j++) {
            let a = attrs[i].attributes[j].nodeName;
            let b = attrs[i].attributes[j].nodeValue;
            attribute = Object.assign(attribute, {[a]: b});
          }
          attribute.parent = node;
          attrsArr.push(attribute);
        }
      }
    }
    return attrsArr;
  }

  checkChildNode(nodes) {
    let node = nodes.ref;
    var parentNode;
    this.childNode = [];
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let complexTypePath = '//xs:element[@name=\'' + node + '\']/xs:complexType';
    let TypePath = '//xs:element[@name=\'' + node + '\']';
    let children: any = {};
    let childArr: any = [];
    let element = select(complexTypePath, this.doc);
    if (element.length > 0) {
      let sequencePath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence';
      let choicePath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:choice';
      let childFromBasePath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:complexContent/xs:extension/@base';
      let childs = select(childFromBasePath, this.doc);
      let element = select(sequencePath, this.doc);
      if (element.length > 0) {
        let childPath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:element';
        let childs = select(childPath, this.doc);
        if (childs.length > 0) {
          for (let i = 0; i < childs.length; i++) {
            children = {};
            for (let j = 0; j < childs[i].attributes.length; j++) {
              let a = childs[i].attributes[j].nodeName;
              let b = childs[i].attributes[j].nodeValue;
              children = Object.assign(children, {[a]: b});
            }
            children.parent = node;
            childArr.push(children);
            this.childNode = childArr;
            console.log(this.childNode);
          }
        }
      }
      if (element.length > 0) {
        let childPath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:choice/xs:element';
        let childs = select(childPath, this.doc);
        if (childs.length > 0) {
          for (let i = 0; i < childs.length; i++) {
            children = {};
            for (let j = 0; j < childs[i].attributes.length; j++) {
              let a = childs[i].attributes[j].nodeName;
              let b = childs[i].attributes[j].nodeValue;
              children = Object.assign(children, {[a]: b});
            }
            children.parent = node;
            children.choice = node;
            childArr.push(children);
            this.childNode = childArr;
          }
        }
      }
      if (element.length > 0) {
        let childPath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:choice/xs:sequence/xs:element';
        let childs = select(childPath, this.doc);
        if (childs.length > 0) {
          for (let i = 0; i < childs.length; i++) {
            children = {};
            for (let j = 0; j < childs[i].attributes.length; j++) {
              let a = childs[i].attributes[j].nodeName;
              let b = childs[i].attributes[j].nodeValue;
              children = Object.assign(children, {[a]: b});
            }
            children.parent = node;
            if (children.minOccurs && !children.maxOccurs) {

            } else {
              childArr.push(children);
            }
            this.childNode = childArr;
          }
        }
        return childArr;
      }
      if ((select(choicePath, this.doc)).length > 0) {
        let childPath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:choice/xs:element';
        let childs = select(childPath, this.doc);
        if (childs.length > 0) {
          for (let i = 0; i < childs.length; i++) {
            children = {};
            for (let j = 0; j < childs[i].attributes.length; j++) {
              let a = childs[i].attributes[j].nodeName;
              let b = childs[i].attributes[j].nodeValue;
              children = Object.assign(children, {[a]: b});
            }
            children.parent = node;
            children.choice = node;
            childArr.push(children);
            this.childNode = childArr;
          }
          return childArr;
        }
      }
      if (childs.length > 0) {
        if (childs[0].nodeValue !== 'NotEmptyType') {
          let childrenPath = '//xs:complexType[@name=\'' + childs[0].nodeValue + '\']/xs:sequence/xs:element';
          let element = select(childrenPath, this.doc);
          if (element.length > 0) {
            for (let i = 0; i < element.length; i++) {
              children = {};
              for (let j = 0; j < element[i].attributes.length; j++) {
                let a = element[i].attributes[j].nodeName;
                let b = element[i].attributes[j].nodeValue;
                children = Object.assign(children, {[a]: b});
              }
              children.parent = node;
              childArr.push(children);
              this.childNode = childArr;
            }
          }
        }
      }
    } else if ((select(TypePath, this.doc).length > 0)) {
      parentNode = node;
      let typeElement = select(TypePath, this.doc);
      if (typeElement.length > 0 && typeElement[0].attributes.length > 0) {
        for (let i = 0; i < typeElement[0].attributes.length; i++) {
          if (typeElement[0].attributes[i].nodeName === 'type') {
            this.addTypeChildNode(typeElement[0].attributes[i].nodeValue, parentNode);
            break;
          }
          if (typeElement[0].attributes[i].nodeValue === 'xs:boolean') {
            nodes = Object.assign(nodes, {values: []});
            let temp: any = {};
            for (let j = 0; j < typeElement[0].attributes.length; j++) {
              let a = typeElement[0].attributes[j].nodeName;
              let b = typeElement[0].attributes[j].nodeValue;
              if (a == 'type') {
                a = 'base';
              }
              if (a == 'default') {
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

  getAttrFromType(nodeValue, parentNode) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let attrTypePath = '//xs:element[@name=\'' + nodeValue + '\']/@type';
    let element = select(attrTypePath, this.doc);
    let attribute: any = {};
    if (element.length > 0) {
      let ele = select(attrTypePath, this.doc);
      for (let i = 0; i < ele.length; i++) {
        let a = ele[i].nodeName;
        let b = ele[i].nodeValue;
        attribute = Object.assign(attribute, {[a]: b});
      }
      attribute.parent = nodeValue;
      attribute.grandFather = parentNode;
    }
    return this.getAttrsFromType(attribute);
  }

  getAttrsFromType(node) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let attrTypePath = '//xs:complexType[@name=\'' + node.type + '\']/xs:simpleContent/xs:extension/xs:attribute/@*';
    let element = select(attrTypePath, this.doc);
    let attrArr = [];
    let attribute: any = {};
    if (element.length > 0) {
      for (let i = 0; i < element.length; i++) {
        let a = element[i].nodeName;
        let b = element[i].nodeValue;
        attribute = Object.assign(attribute, {[a]: b});
      }
      attribute.parent = node.parent;
      attribute.grandFather = node.grandFather;
      let value: any = this.getAttrsValueFromType(attribute, node);
      if (value.length > 0) {
        attribute.values = value;
      }
      attrArr.push(attribute);
      return attrArr;
    }
  }

  getAttrsValueFromType(attr, node) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let valueTypePath = '//xs:complexType[@name=\'' + node.type + '\']/xs:simpleContent/xs:extension/xs:attribute[@name=\'' + attr.name + '\']/xs:simpleType/xs:restriction/xs:enumeration';
    let element = select(valueTypePath, this.doc);
    let value = {};
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

  getValueFromType(nodeValue, parentNode) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let attrTypePath = '//xs:element[@name=\'' + nodeValue + '\']/@type';
    let ele = select(attrTypePath, this.doc);
    let attribute: any = {};
    if (ele.length > 0) {
      for (let i = 0; i < ele.length; i++) {
        let a = ele[i].nodeName;
        let b = ele[i].nodeValue;
        attribute = Object.assign(attribute, {[a]: b});
      }
      attribute.parent = nodeValue;
      attribute.grandFather = parentNode;
    }
    return this.getTypeValue(attribute);
  }

  getTypeValue(node) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let extensionTypePath = '//xs:complexType[@name=\'' + node.type + '\']/xs:simpleContent/xs:extension/@*';
    let element = select(extensionTypePath, this.doc);
    let value: any = {};
    let valueArr: any = [];
    let b;
    if (element.length > 0) {
      if (element[0] && element[0].nodeValue === 'NotEmptyType') {
        let a = element[0].nodeName;
        let x = element[0].nodeValue;
        value = Object.assign(value, {[a]: x});
        let simpleTypePath = '//xs:simpleType[@name=\'' + value.base + '\']/xs:restriction/@*';
        element = select(simpleTypePath, this.doc);
        if (element.length > 0) {
          a = element[0].nodeName;
          b = element[0].nodeValue;
          value = Object.assign(value, {[a]: b});
          let minLengthPath = '//xs:simpleType[@name=\'' + x + '\']/xs:restriction/xs:minLength/@*';
          element = select(minLengthPath, this.doc);
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

  checkText(node) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let documentationPath = '//xs:element[@name=\'' + node + '\']/xs:annotation/xs:documentation/@*';
    let element = select(documentationPath, this.doc);
    let text: any = {};
    if (element.length > 0) {
      for (let i = 0; i < element.length; i++) {
        let a = element[i].nodeName;
        let b = element[i].nodeValue;
        text = Object.assign(text, {[a]: b});
      }
    } else {
      let documentationPath = '//xs:element[@ref=\'' + node + '\']/xs:annotation/xs:documentation/@*';
      let element = select(documentationPath, this.doc);
      for (let i = 0; i < element.length; i++) {
        let a = element[i].nodeName;
        let b = element[i].nodeValue;
        text = Object.assign(text, {[a]: b});
      }
    }
    let documentationPath2 = '//xs:element[@name=\'' + node + '\']/xs:annotation/xs:documentation';
    let element2 = select(documentationPath2, this.doc);
    if (element2.length > 0) {
      text.doc = element2;
    }
    text.parent = node;
    return text;
  }

  checkAttrsText(node) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let textAttrsPath = '//xs:element[@name=\'' + node.parent + '\']/xs:complexType/xs:attribute[@name=\'' + node.name + '\']/xs:annotation/xs:documentation';
    let element = select(textAttrsPath, this.doc);
    let text: any = {};
    if (element.length > 0) {
      text.doc = element;
      node.text = text;
    }
    if (element.length == 0) {
      let textAttrsPath = '//xs:element[@name=\'' + node.parent + '\']/xs:complexType/xs:simpleContent/xs:extension/xs:attribute[@name=\'' + node.name + '\']/xs:annotation/xs:documentation';
      let element = select(textAttrsPath, this.doc);
      text.doc = element;
      node.text = text;
    }
    if (element.length == 0) {
      let textAttrsPath = '//xs:element[@name=\'' + node.parent + '\']/xs:complexType/xs:complexContent/xs:extension/xs:attribute[@name=\'' + node.name + '\']/xs:annotation/xs:documentation';
      let element = select(textAttrsPath, this.doc);
      text.doc = element;
      node.text = text;
    }
  }

  addTypeChildNode(node, parent) {
    var parentNode;
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let complexTypePath = '//xs:complexType[@name=\'' + node + '\']';
    let TypePath = '//xs:element[@name=\'' + node + '\']';
    let children: any = {};
    let childArr: any = [];
    let element = select(complexTypePath, this.doc);
    if (element.length > 0) {
      let sequencePath = '//xs:complexType[@name=\'' + node + '\']/xs:sequence';
      let choicePath = '//xs:complexType[@name=\'' + node + '\']/xs:choice';
      let element = select(sequencePath, this.doc);
      if (element.length > 0) {
        let childPath = '//xs:complexType[@name=\'' + node + '\']/xs:sequence/xs:element';
        let childs = select(childPath, this.doc);
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
            this.childNode = childArr;
          }
          return childArr;
        }
      }

      if ((select(choicePath, this.doc)).length) {
        let childPath = '//xs:complexType[@name=\'' + node + '\']/xs:choice/xs:element';
        let childs = select(childPath, this.doc);
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
            this.childNode = childArr;
          }
          return childArr;
        }
      }
    } else if ((select(TypePath, this.doc).length > 0)) {
      parentNode = node;
      let typeElement = select(TypePath, this.doc);
      if (typeElement.length > 0 && typeElement[0].attributes.length > 0) {
        for (let i = 0; i < typeElement[0].attributes.length; i++) {
          if (typeElement[0].attributes[i].nodeName === 'type') {
            this.addTypeChildNode(typeElement[0].attributes[i].nodeValue, parentNode);
          }
        }
      }
    }
  }

  addChild(child, nodeArr) {
    let attrs = this.checkAttributes(child.ref);
    let text = this.checkText(child.ref);
    let value = this.getValues(child.ref);
    let attrsType: any = this.getAttrFromType(child.ref, child.parent);
    let valueType = this.getValueFromType(child.ref, child.parent);
    child.children = [];
    child.uuid = this.counting;
    child.parentId = nodeArr.uuid;
    this.counting++;
    this.attachAttrs(attrs, child);
    nodeArr.children.push(child);
    this.autoAddChild(child);
    if (!(_.isEmpty(text))) {
      this.addText(text, nodeArr.children);
    }
    if (value !== undefined) {
      this.attachValue(value, nodeArr.children);
    }
    if (valueType !== undefined) {
      this.attachValue(valueType, nodeArr.children);
    }
    if (attrsType !== undefined) {
      this.attachTypeAttrs(attrsType, nodeArr.children);
    }
    this.autoExpand(nodeArr);
    this.printArraya();
  }

  autoAddChild(child) {
    if (this.autoAddCount == 0) {
      let getCh = this.checkChildNode(child);
      if (getCh) {
        for (let i = 0; i < getCh.length; i++) {
          if (getCh[i].minOccurs == undefined || getCh[i].minOccurs == 1) {
            if (!getCh[i].choice) {
              getCh[i].children = [];
              this.autoAddCount++;
              this.addChild(getCh[i], child);
            }
          }
        }
      }
      this.printArraya();
    }
  }

  addText(text, child) {
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

  attachTypeAttrs(attrs, child) {
    for (let i = 0; i < child.length; i++) {
      if (attrs[0] && attrs[0].parent === child[i].ref && attrs[0].grandFather === child[i].parent) {
        if (!child[i].attributes) {
          child[i].attributes = [];
          for (let j = 0; j < attrs.length; j++) {
            this.checkAttrsValue(attrs[j]);
            attrs[j].id = this.counting;
            if (attrs[j].default) {
              attrs[j].data = attrs[j].default;
            }
            this.counting++;
            child[i].attributes.push(attrs[j]);
          }
          this.printArraya();
        }
      }
    }
  }

  attachAttrs(attrs, child) {
    if (!child.attribute) {
      child.attributes = [];
      for (let j = 0; j < attrs.length; j++) {
        this.checkAttrsValue(attrs[j]);
        this.checkAttrsText(attrs[j]);
        attrs[j].id = this.counting;
        this.counting++;
        if (attrs[j].default) {
          attrs[j].data = attrs[j].default;
        }
        child.attributes.push(attrs[j]);
      }
    }
  }

  attachValue(value, child) {
    if (value && value.length > 0 && value[0].grandFather) {
      for (let i = 0; i < child.length; i++) {
        if (value[0] && value[0].parent === child[i].ref && value[0].grandFather === child[i].parent) {
          if (!child[i].values) {
            child[i].values = [];
            for (let j = 0; j < value.length; j++) {
              value[j].uuid = this.counting;
              this.counting++;
              child[i].values.push(value[j]);
            }
            this.printArraya();
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
                value[j].uuid = this.counting;
                this.counting++;
                child[i].values.push(value[j]);
              }
              this.printArraya();
            }
          }
        }
      }
    }
  }

  checkAttrsValue(attrs) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let enumerationPath = '//xs:element[@name=\'' + attrs.parent + '\']//xs:complexType/xs:simpleContent/xs:extension/xs:attribute[@name=\'' + attrs.name + '\']/xs:simpleType/xs:restriction/xs:enumeration';
    let valueArr = [];
    let valueJson = {};
    let value = select(enumerationPath, this.doc);
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
      value = select(enumerationPath, this.doc);
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

  getValues(node) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let extensionPath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:simpleContent/xs:extension/@*';
    let value: any = {};
    let valueArr: any = [];
    let b;
    let element = select(extensionPath, this.doc);
    if (element[0] && element[0].nodeValue === 'NotEmptyType') {
      let a = element[0].nodeName;
      let x = element[0].nodeValue;
      value = Object.assign(value, {[a]: x});
      let simpleTypePath = '//xs:simpleType[@name=\'' + value.base + '\']/xs:restriction/@*';
      element = select(simpleTypePath, this.doc);
      if (element.length > 0) {
        a = element[0].nodeName;
        b = element[0].nodeValue;
        value = Object.assign(value, {[a]: b});
        let minLengthPath = '//xs:simpleType[@name=\'' + x + '\']/xs:restriction/xs:minLength/@*';
        element = select(minLengthPath, this.doc);
        a = element[0].nodeName;
        b = element[0].nodeValue;
        value = Object.assign(value, {[a]: b});
      }
      value.parent = node;
    } else {
      let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
      let extensionPath = '//xs:element[@name=\'' + node + '\']/xs:simpleType/xs:restriction/@*';
      element = select(extensionPath, this.doc);
      if (element.length > 0) {
        let a = element[0].nodeName;
        let b = element[0].nodeValue;
        value = Object.assign(value, {[a]: b});
        let minLengthPath = '//xs:element[@name=\'' + node + '\']/xs:simpleType/xs:restriction/xs:minLength/@*';
        element = select(minLengthPath, this.doc);
        if (element.length > 0) {
          a = element[0].nodeName;
          b = element[0].nodeValue;
          value = Object.assign(value, {[a]: b});
        }
      }
      if (!(_.isEmpty(value)))
        value.parent = node;
    }

    if (!(_.isEmpty(value))) {
      valueArr.push(value);
    }
    return valueArr;
  }

  getCustomCss(node, parentNode) {
    let count = 0;
    if (this.choice) {
      return node.choice ? 'disabled disable-link' : '';
    }
    if (node.maxOccurs === 'unbounded') {
      return '';
    } else if (node.maxOccurs !== 'unbounded' && node.maxOccurs !== undefined) {
      if (parentNode.children.length > 0) {
        for (let i = 0; i < parentNode.children.length; i++) {
          if (node.ref === parentNode.children[i].ref) {
            count++;
          }
        }
        if (node.maxOccurs == count) {
          return 'disabled disable-link';
        }
      }
    } else if (node.maxOccurs === undefined) {
      if (parentNode.children.length > 0) {
        for (let i = 0; i < parentNode.children.length; i++) {
          if (node.ref === parentNode.children[i].ref) {
            return 'disabled disable-link';
          }
        }
      }
    }
  }

  checkmincss(node, parentNode) {
    if (this.choice) {
      let count = 0;
      if (node.maxOccurs === 'unbounded') {
        return '';
      } else if (node.maxOccurs !== 'unbounded' && node.maxOccurs !== undefined) {
        if (parentNode.children.length > 0) {
          for (let i = 0; i < parentNode.children.length; i++) {
            if (node.ref === parentNode.children[i].ref) {
              count++;
            }
          }
          if (node.maxOccurs == count) {
            return 'disabled disable-link';
          }
        }
      } else if (node.maxOccurs === undefined) {
        if (parentNode.children.length > 0) {
          for (let i = 0; i < parentNode.children.length; i++) {
            if (node.ref === parentNode.children[i].ref) {
              return 'disabled disable-link';
            }
          }
        }
      }
    }
  }

  checkDuplicateEntries(child, json) {
    var keys = [];
    var count = 0;
    for (let key in child) {
      keys[count] = key;
      count++;
    }
    for (let i = 0; i < json.length; i++) {
      let count = 0;
      for (let k = 0; k < keys.length; k++) {
        let temp = json[i];
        if (temp[keys[k]] === child[keys[k]]) {
          count++;
        }
        if (count == keys.length) {
          return true;
        }
      }
    }
    return false;
  }

  printArray(rootchildrensattrArr) {
    this.xpath();
    this.AddKeyRefrencing();
    this.nodes.push(rootchildrensattrArr);
    this.options = {
      displayField: 'ref',
      isExpandedField: 'expanded',
      idField: 'uuid',
      allowDrag: true,
      actionMapping: {
        mouse: {
          drop: (tree: TreeModel, node: TreeNode, $event: any, {from, to}) => {
            if (this.dropCheck) {
              this.dropData(from, to);
            }
          },
          dragStart: (tree: TreeModel, node: TreeNode, $event: any) => {
            this.dragFrom = node.data;
          },
          dragOver: (tree: TreeModel, node: TreeNode, $event: any) => {
            this.dragTo = node.data;
            this.dropCheck = this.dragAnddropRules(this.dragFrom, this.dragTo);
          }
        }
      }
    };
  }

  printArraya() {
    this.autoAddCount = 0;
    this.xpath();
    this.AddKeyRefrencing();
    this.options = {
      displayField: 'ref',
      isExpandedField: 'expanded',
      idField: 'uuid',
      allowDrag: true,
      actionMapping: {
        mouse: {
          drop: (tree: TreeModel, node: TreeNode, $event: any, {from, to}) => {
            if (this.dropCheck) {
              this.dropData(from, to);
            }
          },
          dragStart: (tree: TreeModel, node: TreeNode, $event: any) => {
            this.dragFrom = node.data;
          },
          dragOver: (tree: TreeModel, node: TreeNode, $event: any) => {
            this.dragTo = node.data;
            this.dropCheck = this.dragAnddropRules(this.dragFrom, this.dragTo);
          }
        }
      }
    };
  }

  // drag and drop check
  dragAnddropRules(dragNode, dropNode) {
    if (dropNode.ref === dragNode.parent) {
      let count = 0;
      if (dragNode.maxOccurs === 'unbounded') {
        return true;
      } else if (dragNode.maxOccurs !== 'unbounded' && dragNode.maxOccurs !== undefined) {
        if (dropNode.children.length > 0) {
          for (let i = 0; i < dropNode.children.length; i++) {
            if (dragNode.ref === dropNode.children[i].ref) {
              count++;
            }
          }
          return dragNode.maxOccurs != count;
        } else if (dropNode.children.length == 0) {
          return true;
        }
      } else if (dragNode.maxOccurs === undefined) {
        if (dropNode.children.length > 0) {
          for (let i = 0; i < dropNode.children.length; i++) {
            return (dragNode.ref !== dropNode.children[i].ref);
          }
        } else if (dropNode.children.length == 0) {
          return true;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

// drop data
  dropData(from, to) {
    this.dropDataNode(from, to, this.treeCtrl);
    this.removeNode(from.data, this.treeCtrl);
  }

  dropDataNode(from, to, tree) {
    to.parent.data.children.push(from.data);
    tree.treeModel.update();
    this.printArraya();
  }

// to send data in details component
  getData(event) {
    this.selectedNode = event;
    console.log(this.selectedNode)
  }

//Expand automatically on add children
  autoExpand(exNode) {
    setTimeout(() => {
      const someNode = this.treeCtrl.treeModel.getNodeById(exNode.uuid);
      if (someNode) {
        someNode.expand();
      }
    }, 1);
  }

// Expand all Node
  modelExpandAll(): void {
    this.treeCtrl.treeModel.expandAll();
  }

//Collapse all Node
  modelCollapseAll(): void {
    this.treeCtrl.treeModel.collapseAll();
  }

//expand particular node
  expandNode(node) {
    const someNode = this.treeCtrl.treeModel.getNodeById(node.uuid);
    someNode.expand();
  }

  checkChoice(node) {
    if (this.childNode !== undefined) {
      if (this.childNode && this.childNode.length > 0) {
        for (let i = 0; i < this.childNode.length; i++) {
          if (this.childNode[i] && this.childNode[i].choice) {
            if (node.children && node.children.length > 0) {
              for (let j = 0; j < node.children.length; j++) {
                if (node.children[j].choice && node.children[j].ref === this.childNode[i].ref) {
                  this.choice = true;
                }
              }
            } else {
              this.choice = false;
            }
          } else {
            this.choice = false;
          }
        }
      }
    }
  }

// Collapse particular Node
  collapseNode(node) {
    const someNode = this.treeCtrl.treeModel.getNodeById(node.uuid);
    someNode.collapse();
  }

// Remove Node
  removeNode(node, tree) {
    if (node.parent === '#') {
      alert('Cannot Delete Root Node');
    } else {
      this.isNext = false;
      this.getParent(node, tree, this.nodes[0]);
    }
  }

  getParent(node, tree, list) {
    if (node.parentId === list.uuid && list.parent == '#') {
      this.deleteData(list.children, tree, node);
    } else {
      if (list.children) {
        for (let i = 0; i < list.children.length; i++) {
          if (node.parentId === list.children[i].uuid) {
            this.deleteData(list.children[i].children, tree, node);
          } else {
            this.getParent(node, tree, list.children[i]);
          }
        }
      }
    }
  }

  deleteData(parentNode, tree, node) {
    if (parentNode) {
      for (let i = 0; i < parentNode.length; i++) {
        if (node.ref === parentNode[i].ref && node.uuid == parentNode[i].uuid) {
          parentNode.splice(i, 1);
          tree.treeModel.update();
          this.printArraya();
          let temp = {};
          this.getData(temp);
          this.isNext = false;
        }
      }
      if (node.key) {
        if (this.nodes[0].keyref) {
          if (this.nodes[0].attributes.length > 0) {
            for (let i = 0; i < this.nodes[0].attributes.length; i++) {
              if (this.nodes[0].keyref === this.nodes[0].attributes[i].name) {
                for (let j = 0; j < node.attributes.length; i++) {
                  if (node.attributes[j].name == node.key) {
                    if (this.nodes[0].attributes[i].data == node.attributes[j].data) {
                      for (let key in this.nodes[0].attributes[i]) {
                        if (key == 'data') {
                          delete this.nodes[0].attributes[i][key];
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        } else {
          if (this.nodes[0].children) {
            for (let i = 0; i < this.nodes[0].children.length; i++) {
              this.deleteKeyRefData(this.nodes[0].children[i], node);
            }
          }
        }
      }
    }
  }

  deleteKeyRefData(child, node) {
    if (child.keyref) {
      if (child.attributes.length > 0) {
        for (let i = 0; i < child.attributes.length; i++) {
          if (child.keyref === child.attributes[i].name) {
            for (let j = 0; j < node.attributes.length; i++) {
              if (node.attributes[j].name == node.key) {
                if (child.attributes[i].data == node.attributes[j].data) {
                  for (let key in child.attributes[i]) {
                    if (key == 'data') {
                      delete child.attributes[i][key];
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      if (child.children) {
        for (let i = 0; i < child.children.length; i++) {
          this.deleteKeyRefData(child.children[i], node);
        }
      }
    }
  }

// Cut Node
  cutNode(node) {
    this.copyItem = {};
    this.copyItem = Object.assign(this.copyItem, node);
    this.searchAndRemoveNode(node);
    this.cutData = true;
  }

//searchNode
  searchAndRemoveNode(node) {
    if (node.parent === this.nodes[0].ref && node.parentId == this.nodes[0].uuid) {
      for (let i = 0; i < this.nodes[0].children.length; i++) {
        if (node.uuid == this.nodes[0].children[i].uuid) {
          this.nodes[0].children.splice(i, 1);
        }
      }
    } else {
      for (let i = 0; i < this.nodes[0].children.length; i++) {
        this.searchAndRemoveNodeRecursion(node, this.nodes[0].children[i]);
      }
    }
  }

//searchNodeRecursion
  searchAndRemoveNodeRecursion(node, child) {
    if (node.parent === child.ref && node.parentId == child.uuid) {
      for (let i = 0; i < child.children.length; i++) {
        if (node.uuid == child.children[i].uuid) {
          child.children.splice(i, 1);
        }
      }
    } else {
      for (let i = 0; i < child.children.length; i++) {
        this.searchAndRemoveNodeRecursion(node, child.children[i]);
      }
    }
  }

// Copy Node
  copyNode(node) {
    for (let key in node) {
      if (typeof (node[key]) == 'object') {
        this.copyItem = Object.assign({}, this.copyItem, {[key]: []});
        if ((key === 'attributes' || key === 'values') && node[key].length > 0) {
          for (let i = 0; i < node[key].length; i++) {
            let temp = {};
            for (let a in node[key][i]) {
              if (a == 'id') {
                temp = Object.assign(temp, {[a]: this.counting});
                this.counting++;
              } else {
                temp = Object.assign(temp, {[a]: node[key][i][a]});
              }
            }
            this.copyItem[key].push(Object.assign({}, temp));
          }
        } else if (key === 'children' && node[key].length > 0) {
          for (let i = 0; i < node[key].length; i++) {
            let a = this.copyNodeRecursion(node[key][i]);
            this.copyItem[key].push(a);
          }
        } else if (key === 'text') {
          this.copyItem = Object.assign({}, this.copyItem, {[key]: node[key]});
        }
      } else {
        if (key === 'uuid') {
          this.copyItem = Object.assign({}, this.copyItem, {[key]: this.counting});
          this.counting++;
        } else {
          this.copyItem = Object.assign({}, this.copyItem, {[key]: node[key]});
        }
      }
    }
  }

  copyNodeRecursion(node) {
    let tempa = {};
    for (let key in node) {
      if (typeof (node[key]) == 'object') {
        tempa = Object.assign({}, tempa, {[key]: []});
        if ((key === 'attributes' || key === 'values') && node[key].length > 0) {
          for (let i = 0; i < node[key].length; i++) {
            let temp = {};
            for (let a in node[key][i]) {
              if (a == 'id') {
                temp = Object.assign(temp, {[a]: this.counting});
                this.counting++;
              } else {
                temp = Object.assign(temp, {[a]: node[key][i][a]});
              }
            }
            tempa[key].push(Object.assign({}, temp));
          }
        } else if (key === 'children' && node[key].length > 0) {
          for (let i = 0; i < node[key].length; i++) {
            let a = this.copyNodeRecursion(node[key][i]);
            tempa[key].push(a);
          }
        } else if (key === 'text') {
          tempa = Object.assign({}, tempa, {[key]: node[key]});
        }
      } else {
        if (key === 'uuid') {
          tempa = Object.assign({}, tempa, {[key]: this.counting});
          this.counting++;
        } else {
          tempa = Object.assign({}, tempa, {[key]: node[key]});
        }
      }
    }
    return tempa;
  }

// check rules before paste
  checkRules(pasteNode, copyNode) {
    if (copyNode !== undefined) {
      if (pasteNode.ref === copyNode.parent) {
        let count = 0;
        if (copyNode.maxOccurs === 'unbounded') {
          this.checkRule = true;
        } else if (copyNode.maxOccurs !== 'unbounded' && copyNode.maxOccurs !== undefined) {
          if (pasteNode.children.length > 0) {
            for (let i = 0; i < pasteNode.children.length; i++) {
              if (copyNode.ref === pasteNode.children[i].ref) {
                count++;
              }
            }
            if (copyNode.maxOccurs == count) {
              this.checkRule = false;
            } else {
              this.checkRule = true;
            }
          } else if (pasteNode.children.length == 0) {
            this.checkRule = true;
          }
        } else if (copyNode.maxOccurs === undefined) {
          if (pasteNode.children.length > 0) {
            for (let i = 0; i < pasteNode.children.length; i++) {
              if ((copyNode.ref === pasteNode.children[i].ref)) {
                this.checkRule = false;
              } else {
                this.checkRule = true;
              }
            }
          } else if (pasteNode.children.length == 0) {
            this.checkRule = true;
          }
        }
      } else {
        this.checkRule = false;
      }
    }
  }

// Paste Node
  pasteNode(node) {
    node.children.push(this.copyItem);
    this.cutData = false;
    this.checkRule = true;
    this.printArraya();
  }

// attibutes popover
  tooltip(node) {
    let count = 0;
    this.tooltipAttrData = '';
    if (node.attributes) {
      for (let i = 0; i < node.attributes.length; i++) {
        if (node.attributes[i].data) {
          count++;
          let temp = node.attributes[i].name;
          temp = temp + ' = ';
          temp = temp + node.attributes[i].data;
          if (node.attributes.length === count) {
            this.tooltipAttrData = this.tooltipAttrData + temp;
          } else {
            this.tooltipAttrData = this.tooltipAttrData + temp + ' | ';
          }
        }
      }
    }
  }

// Show all Child Nodes and search functionalities.
  showAllChildNode(node) {
    this.showAllChild = [];
    let Rnode = Object.assign({}, {ref: node.ref, parent: '#'});
    this.showAllChild.push(Rnode);
    this.getCNodes(Rnode);
    setTimeout(() => {
      this.createTJson(this.showAllChild);
    }, 1);
  }

  getCNodes(node) {
    let tagName = node.ref;
    let tempNode = node;
    let rootChildChilds;
    if (this.doc.getElementsByTagName('xs:element') !== undefined) {
      rootChildChilds = this.doc.getElementsByTagName('xs:element');
    }
    let rootChildChildsarr = [];
    let childElement;
    let count = 0;
    for (let index = 0; index < rootChildChilds.length; index++) {
      if (rootChildChilds.item(index).getAttributeNode('name') !== undefined) {
        rootChildChildsarr[count] = rootChildChilds.item(index).getAttributeNode('name');
        count++;
        for (let j = 0; j < rootChildChildsarr.length; j++) {
          if (rootChildChildsarr[j].nodeValue === tagName) {
            childElement = rootChildChildsarr[j].ownerElement;
          }
        }
      }
    }
    this.getChildNodes(childElement, tagName, tempNode);
  }

  getChildNodes(childElement, tagName, tempNode) {
    if (childElement && childElement.getElementsByTagName('xs:complexType') !== undefined) {
      let rootChildChilds = childElement.getElementsByTagName('xs:complexType');
      if (childElement.getElementsByTagName('xs:sequence').length !== 0) {
        rootChildChilds = childElement.getElementsByTagName('xs:sequence');
        this.getNode(rootChildChilds, tagName, tempNode);
      }
      if (childElement.getElementsByTagName('xs:choice').length !== 0) {
        rootChildChilds = childElement.getElementsByTagName('xs:choice');
        this.getNode(rootChildChilds, tagName, tempNode);
      }
      if (childElement.getElementsByTagName('xs:simpleType').length !== 0) {
        rootChildChilds = childElement.getElementsByTagName('xs:simpleType');
        this.getNode(rootChildChilds, tagName, tempNode);
      }
      if (childElement.getAttributeNode('type') !== undefined) {
        rootChildChilds = childElement.getAttributeNode('type');
        this.getTypeNode(rootChildChilds, tagName, tempNode);
      }
      if (childElement.getElementsByTagName('xs:extension').length > 0) {
        rootChildChilds = childElement.getElementsByTagName('xs:extension');
        if (rootChildChilds[0].getAttributeNode('base') !== undefined) {
          let x = rootChildChilds[0].getAttributeNode('base');
          if (x.nodeValue !== 'NotEmptyType' && x.nodeValue !== 'xs:anyURI') {
            this.getChildFromBase(x, tagName, tempNode);
          }
        }
      }
    }
  }

  getNode(rootChildChilds, tagName, tempNode) {
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
    let rootchildrensattrArr = [];
    for (let index = 0; index < childs.length; index++) {
      let rootchildrensattr: any = {};
      for (let j = 0; j < childs[index].attributes.length; j++) {
        rootchildrensattr[childs[index].attributes[j].nodeName] = childs[index].attributes[j].nodeValue;
        if (x === tagName || x === undefined) {
          rootchildrensattr = Object.assign(rootchildrensattr, {parent: tagName, grandFather: tempNode.parent});
        } else {
          rootchildrensattr.parent = x;
        }
      }

      rootchildrensattrArr.push(rootchildrensattr);
      if (rootchildrensattr.ref) {
        if (!this.checkDuplicateEntries(rootchildrensattr, this.showAllChild)) {
          this.showAllChild.push(rootchildrensattr);
        }
      }
    }
    for (let i = 0; i < rootchildrensattrArr.length; i++) {
      if (rootchildrensattrArr[i].ref !== undefined) {
        this.getCNodes(rootchildrensattrArr[i]);
      }
    }
  }

  getChildFromBase(child, tagName, tempNode) {
    if (this.doc.getElementsByTagName('xs:complexType') !== undefined) {
      var rootChildChilds = this.doc.getElementsByTagName('xs:complexType');
    }
    var rootChildChildsarr = [];
    var childElement;
    var count = 0;
    for (let index = 0; index < rootChildChilds.length; index++) {
      if (rootChildChilds.item(index).getAttributeNode('name') !== undefined) {
        rootChildChildsarr[count] = rootChildChilds.item(index).getAttributeNode('name');
        count++;
        for (let j = 0; j < rootChildChildsarr.length; j++) {
          if (rootChildChildsarr[j].nodeValue === child.nodeValue) {
            childElement = rootChildChildsarr[j].ownerElement;
          }
        }
      }
    }
    this.getChildNodes(childElement, tagName, tempNode);
  }

  getTypeNode(rootChildChilds, tagName, tempNode) {
    let child = rootChildChilds.nodeValue;
    child = {type: child};
    this.getTChildNode(child.type, tagName, tempNode);
  }

  getTChildNode(child, tagName, tempNode) {
    if (this.doc.getElementsByTagName('xs:complexType') !== undefined) {
      var rootChildChilds = this.doc.getElementsByTagName('xs:complexType');
    }
    var rootChildChildsarr = [];
    var childElement;
    var count = 0;
    for (let index = 0; index < rootChildChilds.length; index++) {
      if (rootChildChilds.item(index).getAttributeNode('name') !== undefined) {
        rootChildChildsarr[count] = rootChildChilds.item(index).getAttributeNode('name');
        count++;
        for (let j = 0; j < rootChildChildsarr.length; j++) {
          if (rootChildChildsarr[j].nodeValue === child) {
            childElement = rootChildChildsarr[j].ownerElement;
          }
        }
      }
    }
    this.getChildNodes(childElement, tagName, tempNode);
  }

  createTJson(json) {
    let arr: any = [];
    this.showAllChildTree = [];
    for (let i = 0; i < json.length; i++) {
      if (json[i].parent === '#') {
        if (!json[i].children) {
          json[i].children = [];
        }
        arr.push(json[i]);
      } else if (json[i].parent !== '#') {
        this.recur(json[i], arr[0]);
      }
    }
    this.showAllChildTree = Object.assign([], arr);
    this.printTreeArray(this.showAllChildTree);
  }

  recur(node, list) {
    if ((node.parent === list.ref || node.parent === list.rootNode) && node.grandFather === list.parent) {
      if (!node.children) {
        node.children = [];
      }
      list.children.push(node);
    } else {
      for (let j = 0; j < list.children.length; j++) {
        this.recur(node, list.children[j]);
      }
    }
  }

  printTreeArray(rootchildrensattrArr) {
    this.sat = rootchildrensattrArr;
    this.options = {
      displayField: 'ref',
      isExpandedField: 'expanded',
    };
    this.innerTreeStruc = '';
    this.innerH();
  }

  innerH() {
    this.innerTreeStruc = '';
    this.innerTreeStruc = this.innerTreeStruc + '<div class=\'keysearch\'>' + this.sat[0].ref + '</div>';
    let temp = this.sat[0].children;
    let temp2;
    for (let i = 0; i < temp.length; i++) {
      this.innerTreeStruc = this.innerTreeStruc + '<div class=\'ml-1 keysearch\'>' + temp[i].ref + '</div>';
      if (temp[i].children && temp[i].children.length > 0) {
        temp2 = temp[i].children;
        this.printCN(temp2);
      }
    }
  }

  printCN(node) {
    let temp;
    const self = this;
    let count = 1;
    for (let i = 0; i < node.length; i++) {
      this.innerTreeStruc = this.innerTreeStruc + '<div class=\'keysearch\' style="margin-left: ' + (10 * count) + 'px">'
        + node[i].ref + '</div>';
      if (node[i].children && node[i].children.length > 0) {
        temp = node[i].children;
        count++;
        printChNode(temp);
      }
    }

    function printChNode(_node) {
      for (let i = 0; i < _node.length; i++) {
        self.innerTreeStruc = self.innerTreeStruc + '<div class=\'keysearch\' style="margin-left: ' + (10 * count) + 'px">'
          + _node[i].ref + '</div>';
        if (_node[i].children && _node[i].children.length > 0) {
          count++;
          printChNode(_node[i].children);
        }
      }
    }
  }

// Show all Child Nodes End
// Search in show all child nodes.
  search(sData) {
    this.counter = 0;
    document.getElementById('innertext').innerHTML = '';
    this.innerH();
    setTimeout(() => {
      document.getElementById('innertext').innerHTML = this.innerTreeStruc;
      var inputText = document.getElementsByClassName('keysearch');
      for (let i = 0; i < inputText.length; i++) {
        var innerHTML = inputText[i].innerHTML;
        var pattern = new RegExp('(' + sData + ')', 'gi');
        let searchPara = innerHTML.toString();
        if (pattern.test(searchPara)) {
          this.counter++;
          innerHTML = searchPara.replace(pattern, function (str) {
            return '<span class=\'highlight\'>' + str + '</span>';
          });
          inputText[i].innerHTML = innerHTML;
        }
      }
    }, 1);
  }

// key and Key Ref Implementation code
  xpath() {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let keyPath = '//xs:key/@name';
    let keyRefPath = '//xs:keyref';
    let keyattrs: any = {};
    let keyRefNodes = select(keyRefPath, this.doc);
    let keyNodes = select(keyPath, this.doc);
    for (let i = 0; i < keyNodes.length; i++) {
      let key = keyNodes[i].nodeName;
      let value = this.strReplace(keyNodes[i].nodeValue);
      keyattrs = Object.assign(keyattrs, {[key]: value});
      for (let j = 0; j < keyNodes[i].ownerElement.childNodes.length; j++) {
        if (keyNodes[i].ownerElement.childNodes[j].nodeName === 'xs:field') {
          for (let k = 0; k < keyNodes[i].ownerElement.childNodes[j].attributes.length; k++) {
            keyattrs.key = this.strReplace(keyNodes[i].ownerElement.childNodes[j].attributes[k].nodeValue);
          }
        }
      }
      this.attachKey(keyattrs);
    }
    for (let i = 0; i < keyRefNodes.length; i++) {
      this.getKeyRef(keyRefNodes[i]);
    }
  }

  getKeyRef(keyRefNodes) {
    let attrs: any = {};
    for (let i = 0; i < keyRefNodes.attributes.length; i++) {
      let key = keyRefNodes.attributes[i].nodeName;
      let value = this.strReplace(keyRefNodes.attributes[i].nodeValue);
      attrs = Object.assign(attrs, {[key]: value});
      for (let j = 0; j < keyRefNodes.attributes[0].ownerElement.childNodes.length; j++) {
        if (keyRefNodes.attributes[0].ownerElement.childNodes[j].nodeName === 'xs:field') {
          for (let k = 0; k < keyRefNodes.attributes[0].ownerElement.childNodes[j].attributes.length; k++) {
            attrs.keyref = this.strReplace(keyRefNodes.attributes[0].ownerElement.childNodes[j].attributes[k].nodeValue);
          }
        }
      }
    }
    this.attachKeyRefNodes(attrs);
  }

  attachKey(key) {
    this.AddKeyAndKeyref(key);
  }

  attachKeyRefNodes(keyrefnodes) {
    this.AddKeyAndKeyref(keyrefnodes);
  }

  AddKeyAndKeyref(nodes) {
    let ke = false;
    let keyref = false;
    for (let key in nodes) {
      if (key === 'key') {
        ke = true;
      } else if (key === 'keyref') {
        keyref = true;
      }
    }
    if (this.nodes[0]) {
      for (let i = 0; i < this.nodes[0].children.length; i++) {
        if (this.nodes[0].children[i].ref === nodes.name) {
          if (ke) {
            this.nodes[0].children[i].key = nodes.key;
          } else if (keyref) {
            this.nodes[0].children[i].keyref = nodes.keyref;
          }
        } else {
          if (this.nodes[0].children[i].children) {
            recursion(nodes, this.nodes[0].children[i].children);
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
        } else if (key === 'keyref') {
          keyref = true;
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

  strReplace(data) {
    return data.replace(/(Key|@)/g, '');
  }

  AddKeyRefrencing() {
    let key = {};
    if (this.nodes[0] && this.nodes[0].keyref) {
      for (let i = 0; i < this.nodes[0].attributes.length; i++) {
        if (this.nodes[0].attributes[i].refer) {
          key = Object.assign(key, {refe: this.nodes[0].ref, name: this.nodes[0].attributes[i].refer});
          this.attachKeyRefrencing(key);
        }
      }
    } else {
      if (this.nodes[0]) {
        for (let i = 0; i < this.nodes[0].children.length; i++) {
          this.AddKeyRefrencingRecursion(this.nodes[0].children[i]);
        }
      }
    }
  }

  AddKeyRefrencingRecursion(child) {
    let key = {};
    if (child.keyref && child.attributes) {
      for (let i = 0; i < child.attributes.length; i++) {
        if (child.attributes[i].refer) {
          key = Object.assign(key, {refe: child.ref, name: child.attributes[i].refer});
          this.attachKeyRefrencing(key);
        }
      }
    } else {
      for (let i = 0; i < child.children.length; i++) {
        this.AddKeyRefrencingRecursion(child.children[i]);
      }
    }
  }

  attachKeyRefrencing(key) {
    if (key.name) {
      if (this.nodes[0].ref === key.name && this.nodes[0].key) {
        for (let i = 0; i < this.nodes[0].attributes.length; i++) {
          if (this.nodes[0].attributes[i].name === this.nodes[0].key) {
            this.nodes[0].attributes[i].refElement = key.refe;
          }
        }
      } else {
        for (let i = 0; i < this.nodes[0].children.length; i++) {
          this.attachKeyRefrencingRecursion(key, this.nodes[0].children[i]);
        }
      }
    }
  }

  attachKeyRefrencingRecursion(key, child) {
    if (key.name) {
      if (child.ref === key.name && child.key && child.attributes) {
        for (let i = 0; i < child.attributes.length; i++) {
          if (child.attributes[i].name === child.key) {
            var a = key.refe;
            child.attributes[i].refElement = a;
          }
        }
      } else {
        for (let i = 0; i < child.children.length; i++) {
          this.attachKeyRefrencingRecursion(key, child.children[i]);
        }
      }
    }
  }

// details meathod
  onChange(event, nodes) {
    if (/[a-zA-Z0-9_]+.*$/.test(event)) {
      this.error = true;
    } else {
      nodes.values[0] = Object.assign(nodes.values[0], {data: event});
    }
  }

//validation for attributes
  validateAttr(value, tag) {
    if (tag.type === 'xs:NMTOKEN') {
      if (/\s/.test(value)) {
        this.error = true;
        this.text = tag.name + ': Space not allowed';
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
            }
          }
        }
      } else if (value == '' && tag.use === 'required') {
        this.error = true;
        this.text = tag.name + ': Required Field';
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
            }
          }
        }
      } else {
        this.error = false;
      }
    } else if (tag.type === 'xs:string') {
      if (/[a-zA-Z0-9_]+.*$/.test(value)) {
        this.error = false;
      } else if (tag.use === 'required') {

        this.error = true;
        this.text = tag.name + ': Required Field';
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
            }
          }
        }
      } else if (value.length > 0) {
        this.error = true;
        this.text = tag.name + ': Can not add blank space in begining.';
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
            }
          }
        }
      } else {
        this.error = false;
      }
    } else if (tag.type === 'xs:positiveInteger') {
      if (/[0-9]/.test(value)) {
        this.error = false;
        this.submitData(value, tag);
      } else if (tag.use === 'required' && value === '') {
        this.error = true;
        this.text = tag.name + ': Required Field';
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
            }
          }
        }
      } else if (/[a-zA-Z_*]/.test(value)) {
        this.error = true;
        this.text = tag.name + ': Only Add positive numbers';
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
            }
          }
        }
      } else {
        this.error = true;
        this.text = tag.name + ': can not be negative';
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
            }
          }
        }
      }
    } else {
      tag = Object.assign(tag, {data: value});
    }
  }

  submitData(value, tag) {
    if (tag.type === 'xs:NMTOKEN') {
      if (/\s/.test(value)) {
        this.error = true;
        this.text = tag.name + ': Space not allowed';
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
            }
          }
        }
      } else if (value == '' && tag.use === 'required') {
        this.error = true;
        this.text = tag.name + ': Required Field';
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
            }
          }
        }
      } else {
        this.error = false;
        tag = Object.assign(tag, {data: value});
      }
    } else if (tag.type === 'xs:string') {
      if (/[a-zA-Z0-9_]+.*$/.test(value)) {
        this.error = false;
        tag = Object.assign(tag, {data: value});
      } else if (tag.use === 'required') {
        this.error = true;
        this.text = tag.name + ': Required Field';
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
            }
          }
        }
      } else if (value.length > 0) {
        this.error = true;
        this.text = tag.name + ': Can not add blank space in begining.';
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
            }
          }
        }
      } else {
        this.error = false;
      }
    } else if (tag.type === 'xs:positiveInteger') {
      if (/[0-9]/.test(value)) {
        this.error = false;
        tag = Object.assign(tag, {data: value});
      } else if (tag.use === 'required' && value === '') {
        this.error = true;
        this.text = tag.name + ': Required Field';
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
            }
          }
        }
      } else if (/[a-zA-Z_*]/.test(value)) {
        this.error = true;
        this.text = tag.name + ': Only Add positive numbers';
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
            }
          }
        }
      } else {
        this.error = true;
        this.text = tag.name + ': can not be negative';
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
            }
          }
        }
      }
    } else {
      if (/[0-9]/.test(value)) {
        this.error = false;
        tag = Object.assign(tag, {data: value});
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
            }
          }
        }
      } else if (tag.use === 'required' && value === '') {
        this.error = true;
        this.text = tag.name + ': Required Field';
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
            }
          }
        }
      } else if (value = '') {
        tag = Object.assign(tag, {data: tag.defalut});
      }
    }
  }

//validation for node value property
  validValue(value, ref, tag) {
    this.error = false;
    if (/[a-zA-Z0-9_]+.*$/.test(value)) {
      this.error = false;
    } else {
      this.error = true;
      this.text = 'Required Field';
      this.errorName = ref;
      if (tag.data !== undefined) {
        for (let key in tag) {
          if (key == 'data') {
            delete tag[key];
          }
        }
      }
    }
  }

  submitValue(value, ref, tag) {
    if (/[a-zA-Z0-9_]+.*$/.test(value)) {
      this.error = false;
      tag = Object.assign(tag, {data: value});
    } else {
      this.error = true;
      this.text = 'Required Field';
      this.errorName = ref;
      if (tag.data !== undefined) {
        for (let key in tag) {
          if (key == 'data') {
            delete tag[key];
          }
        }
      }
    }
  }

  getDataAttr(refer) {
    this.tempArr = [];
    var temp;
    for (let i = 0; i < this.nodes[0].children.length; i++) {
      if (this.nodes[0].children[i].ref === refer) {
        if (this.nodes[0].children[i].key) {
          temp = this.nodes[0].children[i].key;
          for (let j = 0; j < this.nodes[0].children[i].attributes.length; j++) {
            if (this.nodes[0].children[i].attributes[j].name === temp) {
              if (this.nodes[0].children[i].attributes[j] && this.nodes[0].children[i].attributes[j].data) {
                this.tempArr.push(this.nodes[0].children[i].attributes[j].data);
              }
            }
          }
        }
      } else {
        if (this.nodes[0].children[i].children) {
          this.keyrecursion(refer, this.nodes[0].children[i].children);
        }
      }
    }
  }

  keyrecursion(refer, childNode) {
    var temp;
    for (let i = 0; i < childNode.length; i++) {
      if (childNode[i].ref === refer) {
        if (childNode[i].key) {
          temp = childNode[i].key;
          for (let j = 0; j < childNode[i].attributes.length; j++) {
            if (childNode[i].attributes[j].name === temp) {
              if (childNode[i].attributes[j] && childNode[i].attributes[j].data) {
                this.tempArr.push(childNode[i].attributes[j].data);
              }
            }
          }
        }
      } else {
        if (this.nodes[0].children[i] && this.nodes[0].children[i].children) {
          this.keyrecursion(refer, childNode[i].children);
        }
      }
    }
  }


// link gotokey
  gotoKey(node) {
    if (node !== undefined) {
      if (node.refer === this.nodes[0].ref) {
        if (this.nodes[0].key) {
          for (let i = 0; i < this.nodes[0].attributes.length; i++) {
            if (this.nodes[0].attributes[i].name === this.nodes[0].key) {
              if (node.data === this.nodes[0].attributes[i].data) {
                this.selectedNode = this.nodes[0];
              }
            }
          }
        } else {
          for (let i = 0; i < this.nodes[0].children.length; i++) {
            this.gotoKeyRecursion(node, this.nodes[0].children[i]);
          }
        }
      } else {
        for (let i = 0; i < this.nodes[0].children.length; i++) {
          this.gotoKeyRecursion(node, this.nodes[0].children[i]);
        }
      }
    }
  }

  gotoKeyRecursion(node, child) {
    if (node !== undefined) {
      if (node.refer === child.ref) {
        if (child.key) {
          for (let i = 0; i < child.attributes.length; i++) {
            if (child.attributes[i].name === child.key) {
              if (node.data === child.attributes[i].data) {
                this.selectedNode = child;
              }
            }
          }
        } else {
          for (let i = 0; i < child.children.length; i++) {
            this.gotoKeyRecursion(node, child.children[i]);
          }
        }
      } else {
        for (let i = 0; i < child.children.length; i++) {
          this.gotoKeyRecursion(node, child.children[i]);
        }
      }
    }
  }


  gotoKeyref(node) {
    if (node !== undefined) {
      if (node.refElement === this.nodes[0].ref) {
        if (this.nodes[0].keyref) {
          for (let i = 0; i < this.nodes[0].attributes.length; i++) {
            if (this.nodes[0].attributes[i].name === this.nodes[0].keyref) {
              if (node.data === this.nodes[0].attributes[i].data) {
                this.selectedNode = this.nodes[0];
              }
            }
          }
        } else {
          for (let i = 0; i < this.nodes[0].children.length; i++) {
            this.gotoKeyrefRecursion(node, this.nodes[0].children[i]);
          }
        }
      } else {
        for (let i = 0; i < this.nodes[0].children.length; i++) {
          this.gotoKeyrefRecursion(node, this.nodes[0].children[i]);
        }
      }
    }
  }

  gotoKeyrefRecursion(node, child) {
    if (node !== undefined) {
      if (node.refElement === child.ref) {
        if (child.keyref) {
          for (let i = 0; i < child.attributes.length; i++) {
            if (child.attributes[i].name === child.keyref) {
              if (node.data === child.attributes[i].data) {
                this.selectedNode = child;
              }
            }
          }
        } else {
          for (let i = 0; i < child.children.length; i++) {
            this.gotoKeyrefRecursion(node, child.children[i]);
          }
        }
      } else {
        for (let i = 0; i < child.children.length; i++) {
          this.gotoKeyrefRecursion(node, child.children[i]);
        }
      }
    }
  }

  // dashboard Meathod
  // create Xml from Json
  showXml() {
    this.xml = this.jsonToXml();
    var xmlAsString = new XMLSerializer().serializeToString(this.xml);
    let a = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>`;
    a = a.concat(xmlAsString);
    this.xml = vkbeautify.xml(a);
  }

  jsonToXml() {
    var doc = document.implementation.createDocument('', '', null);
    let peopleElem = doc.createElement(this.nodes[0].ref);
    for (let i = 0; i < this.nodes[0].attributes.length; i++) {
      if (this.nodes[0].attributes[i].data !== undefined)
        peopleElem.setAttribute(this.nodes[0].attributes[i].name, this.nodes[0].attributes[i].data);
    }
    if (this.nodes[0] && this.nodes[0].values && this.nodes[0].values.length >= 0) {
      for (let i = 0; i < this.nodes[0].values.length; i++) {
        if (this.nodes[0].values[0].data !== undefined)
          peopleElem.createCDATASection(this.nodes[0].values[0].data);
      }
    }
    if (this.nodes[0].children.length > 0) {
      for (let i = 0; i < this.nodes[0].children.length; i++) {
        var personElem1 = doc.createElement(this.nodes[0].children[i].ref);
        this.createChildJson(peopleElem, this.nodes[0].children[i], personElem1, doc);
      }
    }
    return peopleElem;
  }

  createChildJson(node, childrenNode, curentNode, doc) {
    if (childrenNode.attributes)
      for (let i = 0; i < childrenNode.attributes.length; i++) {
        if (childrenNode.attributes[i].data !== undefined)
          curentNode.setAttribute(childrenNode.attributes[i].name, childrenNode.attributes[i].data);
      }
    if (childrenNode && childrenNode.values && childrenNode.values.length >= 0) {
      for (let i = 0; i < childrenNode.values.length; i++) {
        if (childrenNode.values[i].data !== undefined)
          var a = doc.createCDATASection(childrenNode.values[i].data);
        if (a)
          curentNode.appendChild(a);
      }
    }
    if (childrenNode.children && childrenNode.children.length > 0) {
      for (let i = 0; i < childrenNode.children.length; i++) {
        var personElem1 = doc.createElement(childrenNode.children[i].ref);
        this.createChildJson(curentNode, childrenNode.children[i], personElem1, doc);
      }
    }
    node.appendChild(curentNode);
  }

  // save xml
  save() {
    this.showXml();
    this.validXml = this.validate();
    if (this.validXml === 'true') {
      let name = this.nodes[0].ref + '.xml';
      let fileType = 'application/xml';
      let blob = new Blob([this.xml], {type: fileType});
      saveAs(blob, name);
    }
  }

  // validate xml
  validate() {
    this.showXml();
    if (this.nodes && this.nodes[0].attributes && this.nodes[0].attributes.length > 0) {
      for (let i = 0; i < this.nodes[0].attributes.length; i++) {
        if (this.nodes[0].attributes[i].use === 'required') {
          if (this.nodes[0].attributes[i].data === undefined) {
            this.popToast(this.nodes[0].attributes[i]);
            this.errorLocation = this.nodes[0];
            return this.nodes[0].attributes[i];
          }
        }
      }
    }
    if (this.nodes && this.nodes[0].values) {
      if (this.nodes[0].values[0].data === undefined) {
        this.errorLocation = this.nodes[0];
        return this.nodes[0].values[0];
      }
    }
    if (this.nodes && this.nodes[0].children.length > 0) {
      for (let i = 0; i < this.nodes[0].children.length; i++) {
        let x = this.validateRecursion(this.nodes[0].children[i]);
        if (x !== undefined) {
          return x;
        }
      }
    }
    this.successPopToast();
    return 'true';
  }

  validateRecursion(child) {
    if (child.attributes && child.attributes.length > 0) {
      for (let i = 0; i < child.attributes.length; i++) {
        if (child.attributes[i].use === 'required') {
          if (child.attributes[i].data === undefined) {
            this.popToast(child.attributes[i]);
            this.errorLocation = child;
            return child.attributes[i];
          }
        }
      }
    }
    if (child && child.values) {
      if (child.values[0].data === undefined) {
        this.popToast(child.values[0]);
        this.errorLocation = child;
        return child.values[0];
      }
    }
    if (child.children && child.children.length > 0) {
      for (let i = 0; i < child.children.length; i++) {
        var x = this.validateRecursion(child.children[i]);
        if (x !== undefined) {
          return x;
        }
      }
    }
  }

  getpos() {
  $(function () {
    $('[data-toggle="tooltip"]').tooltip({
      html:true
    })
  });
}

  // toaster pop toast
  popToast(node) {
    let msg = '';
    if (node && node.name) {
      msg = 'Attribute "' + node.name + '" cannot be empty';

    } else {
      msg = 'cannot be empty';
    }
    this.toasterService.pop('error', 'Element : ' + node.parent, msg);
  }

  successPopToast() {
    this.toasterService.pop('success', 'Element : ' + this.nodes[0].ref, 'XML is valid');
  }

  // goto error location
  gotoErrorLocation() {
    this.selectedNode = this.errorLocation;
  }

  // import xml
  onFileSelected(event: any): void {
    let self = this;
    let item = event['0'];
    let fileExt = item.name.slice(item.name.lastIndexOf('.') + 1).toUpperCase();
    if (fileExt != 'XML') {
      this.toasterService.pop('error', '', fileExt + ' ' + 'invalid file type');
    } else {
      this.fileLoading = false;
      this.selectedXMLFile = item;
      let reader = new FileReader();
      reader.readAsText(item, 'UTF-8');
      reader.onload = onLoadFile;
      setTimeout(() => {
        if (this.uploadData !== undefined && this.uploadData !== '') {
          this.dataLoad = true;
        } else {
          this.dataLoad = false;
          this.toasterService.pop('error', 'Invalid xml file or file must be empty');
        }
      }, 50);
    }

    function onLoadFile(event) {
      let data = event.target.result;
      self.uploadData = data;
    }
  }

  // reassign xsd on import xml
  reassignxsd(selectedXsd) {
    this.selectedXsd = selectedXsd;
    this.assignXsd = this.selectedXsd !== '';
  }

  // submit data
  onSubmit() {
    this.nodes = [];
    this.uploadModelClose.nativeElement.click();
    this.reassignSchema();
    this.createJsonfromXml(this.uploadData);
  }

  // create json from xml
  createJsonfromXml(data) {
    let result1: any = convert.xml2json(data, {
      compact: true,
      spaces: 4,
      ignoreDeclaration: true,
      ignoreComment: true,
      alwaysChildren: true
    });
    let rootNode;
    let x: any = JSON.parse(result1);
    for (let key in x) {
      rootNode = key;
    }

    if (this.nodes[0].ref === rootNode) {
      this.createJsonAccToXsd(x, rootNode, this.nodes[0]);
    } else {
      this.nodes = [{}];
      this.createNormalTreeJson(x, rootNode, this.nodes[0], '#');
    }
  }

  createJsonAccToXsd(xmljson, rootNode, mainjson) {
    mainjson.children = [];
    if (xmljson[rootNode]._attributes !== undefined) {
      for (let key in xmljson[rootNode]._attributes) {
        for (let i = 0; i < mainjson.attributes.length; i++) {
          if (key === mainjson.attributes[i].name) {
            let a = xmljson[rootNode]._attributes[key];
            mainjson.attributes[i] = Object.assign(mainjson.attributes[i], {data: a});
          }
        }
      }
    }
    if (xmljson[rootNode] && xmljson[rootNode]._cdata !== undefined) {
      mainjson.values[0] = Object.assign(mainjson.values[0], {data: xmljson[rootNode]._cdata});
    }

    for (let key in xmljson[rootNode]) {
      if (key !== '_attributes' && key !== '_cdata') {
        this.addChildForxml(key, rootNode, xmljson, mainjson);
      }
    }
  }

  addChildForxml(key, rootNode, xmljson, mainjson) {
    this.checkChildNode(mainjson);
    for (let i = 0; i < this.childNode.length; i++) {
      if (key === this.childNode[i].ref) {
        this.addChild(this.childNode[i], mainjson);
      }
    }
    for (let i = 0; i < mainjson.children.length; i++) {
      if (mainjson.children[i].ref == key) {
        this.createJsonAccToXsd(xmljson[rootNode], key, mainjson.children[i]);
      }
    }
  }

  // create json if xsd not matched
  createNormalTreeJson(xmljson, rootNode, mainjson, parent) {
    let temp = {};
    this.getData(temp);
    mainjson = Object.assign(mainjson, {ref: rootNode, parent: parent});
    for (let key in xmljson[rootNode]) {
      if (key === '_attributes') {
        mainjson = Object.assign(mainjson, {attributes: []});
        for (let x in xmljson[rootNode]._attributes) {
          let dat = xmljson[rootNode]._attributes[x];
          let temp = {};
          temp = Object.assign(temp, {name: x, data: dat, parent: rootNode});
          mainjson.attributes.push(temp);
        }
      }
    }
    for (let key in xmljson[rootNode]) {
      if (key !== '_attributes' && key !== '_cdata') {
        if (!mainjson.children) {
          mainjson = Object.assign(mainjson, {children: []});
        }
        this.addChildToNormal(key, rootNode, xmljson, mainjson);
      }
    }
  }

  addChildToNormal(key, rootNode, xmljson, mainjson) {
    let temp: any = {};
    temp = Object.assign(temp, {ref: key, parent: rootNode});
    mainjson.children.push(temp);
    for (let i = 0; i < mainjson.children.length; i++) {
      if (mainjson.children[i].ref === key) {
        this.createNormalTreeJson(xmljson[rootNode], key, mainjson.children[i], rootNode);
      }
    }
  }
}
