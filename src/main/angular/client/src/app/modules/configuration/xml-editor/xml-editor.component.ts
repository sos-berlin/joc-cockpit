import {Component, Input, OnInit, ViewChild, OnDestroy, HostListener, AfterViewInit} from '@angular/core';
import {NzFormatEmitEvent, NzTreeNode, NzFormatBeforeDropEvent} from 'ng-zorro-antd';
import {TranslateService} from '@ngx-translate/core';
import {ToasterService} from 'angular2-toaster';
import {FileUploader} from 'ng2-file-upload';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Subscription, of, Observable} from 'rxjs';
import {Router} from '@angular/router';
import {ClipboardService} from 'ngx-clipboard';
import {saveAs} from 'file-saver';
import * as _ from 'underscore';
import {AuthService} from '../../../components/guard';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';

declare const require;
declare const vkbeautify;
declare const $;

const xpath = require('xpath');
const convert = require('xml-js');

@Component({
  selector: 'app-show-child-modal',
  templateUrl: './show-child-dialog.html'
})
export class ShowChildModalComponent implements OnInit {
  @Input() doc: any;
  @Input() showAllChild: any;

  counter = 0;
  data: string;
  options: any = {};
  selectedNode: any;
  isExpandAll = false;
  nodes = [];

  constructor(public activeModal: NgbActiveModal, public coreService: CoreService) {
  }

  ngOnInit(): void {
    this.getText(this.showAllChild[0]);
    this.printTreeArray();
    let obj: any = this.showAllChild[0];
    obj.title = obj.ref;
    // tslint:disable-next-line: forin
    for (let child in obj.children) {
      obj.children[child].children = [];
      obj.children[child].title = obj.children[child].ref;
      this.checkChildNode(obj.children[child], obj.children[child]);
      this.recursiveGetAllChilds(obj.children[child].children);
    }
  }

  recursiveGetAllChilds(list: any) {
    // tslint:disable-next-line: forin
    for (let child in list) {
      list[child].children = [];
      this.checkChildNode(list[child], list[child]);
      this.printTreeArray();
      this.recursiveGetAllChilds(list[child].children);
    }
  }

  openFolder(data: NzTreeNode | NzFormatEmitEvent): void {
    if (data instanceof NzTreeNode) {
      data.isExpanded = !data.isExpanded;
    } else {
      let node = data.node;
      if (node) {
        node.isExpanded = !node.isExpanded;
      }
    }
  }


  getText(data) {
    this.selectedNode = data;
    this.selectedNode.doc = this.checkText(data.ref);
  }

  checkText(node) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let text: any = {};
    let documentationPath2 = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:annotation/xs:documentation';
    let element2 = select(documentationPath2, this.doc);
    if (element2.length > 0) {
      text.doc = element2[0].innerHTML;
    }
    text.parent = node;
    return text;
  }

  toggleExpanded(e): void {
    e.node.data.isExpanded = e.isExpanded;
  }

  private expandCollapseRec(node, flag) {
    for (let i = 0; i < node.length; i++) {
      if (node[i].children && node[i].children.length > 0) {
        node[i].expanded = flag;
        this.expandCollapseRec(node[i].children, flag);
      }
    }
    this.printTreeArray();
  }

  expandAll() {
    this.isExpandAll = true;
    this.printTreeArray();
  }

  collapseAll() {
    this.isExpandAll = false;
    this.printTreeArray();
    for (let i = 0; i < this.showAllChild.length; i++) {
      this.showAllChild[i].expanded = false;
      if (this.showAllChild[i].children && this.showAllChild[i].children.length > 0) {
        this.expandCollapseRec(this.showAllChild[i].children, false);
      }
    }
  }


  search(q) {
    let count = 0;
    this.counter = 0;
    let checkExpand = {expanded: false, parent: this.showAllChild};
    for (let i = 0; i < this.showAllChild.length; i++) {
      this.showAllChild[i].isSearch = false;
      if (q) {
        let pattern = new RegExp('(' + q + ')', 'gi');
        if (pattern.test(this.showAllChild[i].ref)) {
          this.showAllChild[i].isSearch = true;
          ++count;
        }
      }
      this.counter = count;
      this.showAllChild[i].expanded = true;
      checkExpand.parent = this.showAllChild[i];
      this.getFilteredData(q, this.showAllChild[i].children, checkExpand);
    }
  }

  getFilteredData(q, arr, checkExpand) {
    let count = 0;
    for (let i = 0; i < arr.length; i++) {
      arr[i].isSearch = false;
      if (q) {
        let pattern = new RegExp('(' + q + ')', 'gi');
        if (pattern.test(arr[i].ref)) {
          arr[i].isSearch = true;
          ++count;
          if (count > 0 && !checkExpand.isExpand) {
            checkExpand.parent.expanded = true;
            for (let j = 2; j < 10; j++) {
              let key = 'parent' + j;
              if (checkExpand[key]) {
                checkExpand[key].expanded = true;
              }
            }
            checkExpand.isExpand = true;
          }
        }
      }
    }
    this.counter = this.counter + count;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].children && arr[i].children.length > 0) {
        if (!checkExpand.isExpand) {
          if (checkExpand.parent.ref === arr[i].parent) {
            checkExpand.parent2 = arr[i];
          }
          if (checkExpand.parent2 && checkExpand.parent2.ref === arr[i].parent) {
            checkExpand.parent3 = arr[i];
          }
          if (checkExpand.parent3 && checkExpand.parent3.ref === arr[i].parent) {
            checkExpand.parent4 = arr[i];
          }
          if (checkExpand.parent4 && checkExpand.parent4.ref === arr[i].parent) {
            checkExpand.parent5 = arr[i];
          }
          if (checkExpand.parent5 && checkExpand.parent5.ref === arr[i].parent) {
            checkExpand.parent6 = arr[i];
          }
          if (checkExpand.parent6 && checkExpand.parent6.ref === arr[i].parent) {
            checkExpand.parent7 = arr[i];
          }
          if (checkExpand.parent7 && checkExpand.parent7.ref === arr[i].parent) {
            checkExpand.parent8 = arr[i];
          }
          if (checkExpand.parent8 && checkExpand.parent8.ref === arr[i].parent) {
            checkExpand.parent9 = arr[i];
          }
          if (checkExpand.parent9 && checkExpand.parent9.ref === arr[i].parent) {
            checkExpand.parent10 = arr[i];
          }
        }
        this.getFilteredData(q, arr[i].children, checkExpand);
      }
    }
    this.printTreeArray();
  }


  printTreeArray() {
    this.showAllChild = [...this.showAllChild];
  }

  checkChildNode(showAllChild, data) {
    let node = showAllChild.ref;
    let parentNode;
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let complexTypePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType';
    let TypePath = '/xs:schema/xs:element[@name=\'' + node + '\']';
    let nodes: any = {};
    let childArr: any = [];
    let element = select(complexTypePath, this.doc);
    if (element.length > 0) {
      let sequencePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence';
      let choicePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:choice';
      let childFromBasePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:complexContent/xs:extension/@base';
      // tslint:disable-next-line: max-line-length
      let complexContentWithElementPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:complexContent/xs:extension/xs:sequence/xs:element';
      let childs = select(childFromBasePath, this.doc);
      let element1 = select(sequencePath, this.doc);
      if (element1.length > 0) {
        let cPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:element';
        let cElement = select(cPath, this.doc);
        if (cElement.length > 0) {
          for (let i = 0; i < cElement.length; i++) {
            nodes = {};
            for (let j = 0; j < cElement[i].attributes.length; j++) {
              let a = cElement[i].attributes[j].nodeName;
              let b = cElement[i].attributes[j].nodeValue;
              nodes = Object.assign(nodes, {[a]: b});
              if (a === 'ref') {
                nodes = Object.assign(nodes, {title: b});
              }
            }
            nodes.parent = node;
            childArr.push(nodes);
            if (data) {
              data.children = childArr;
            }
          }
        }
        let dPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:choice/xs:element';
        let dElement = select(dPath, this.doc);
        if (dElement.length > 0) {
          for (let i = 0; i < dElement.length; i++) {
            nodes = {};
            for (let j = 0; j < dElement[i].attributes.length; j++) {
              let a = dElement[i].attributes[j].nodeName;
              let b = dElement[i].attributes[j].nodeValue;
              nodes = Object.assign(nodes, {[a]: b});
              if (a === 'ref') {
                nodes = Object.assign(nodes, {title: b});
              }
            }
            nodes.parent = node;
            nodes.choice = node;
            childArr.push(nodes);
            if (data) {
              data.children = childArr;
            }
          }
        }
        let ePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:choice/xs:sequence/xs:element';
        let eElement = select(ePath, this.doc);
        if (eElement.length > 0) {
          for (let i = 0; i < eElement.length; i++) {
            nodes = {};
            for (let j = 0; j < eElement[i].attributes.length; j++) {
              let a = eElement[i].attributes[j].nodeName;
              let b = eElement[i].attributes[j].nodeValue;
              nodes = Object.assign(nodes, {[a]: b});
              if (a === 'ref') {
                nodes = Object.assign(nodes, {title: b});
              }
            }
            nodes.parent = node;
            if (nodes.ref !== 'Minimum' && nodes.ref !== 'Maximum') {
              nodes.choice = node;
            }
            if (nodes.minOccurs && !nodes.maxOccurs) {
            } else {
              childArr.push(nodes);
            }
            if (data) {
              data.children = childArr;
            }
          }
        }
        return childArr;
      }
      if ((select(choicePath, this.doc)).length > 0) {
        let childPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:choice/xs:element';
        let childs1 = select(childPath, this.doc);
        if (childs1.length > 0) {
          for (let i = 0; i < childs1.length; i++) {
            nodes = {};
            for (let j = 0; j < childs1[i].attributes.length; j++) {
              let a = childs1[i].attributes[j].nodeName;
              let b = childs1[i].attributes[j].nodeValue;
              nodes = Object.assign(nodes, {[a]: b});
              if (a === 'ref') {
                nodes = Object.assign(nodes, {title: b});
              }
            }
            nodes.parent = node;
            nodes.choice = node;
            childArr.push(nodes);
            if (data) {
              data.children = childArr;
            }
          }
          let childPath2 = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:choice/xs:sequence/xs:element';
          let child12 = select(childPath2, this.doc);
          if (child12.length > 0) {
            for (let i = 0; i < child12.length; i++) {
              nodes = {};
              for (let j = 0; j < child12[i].attributes.length; j++) {
                let a = child12[i].attributes[j].nodeName;
                let b = child12[i].attributes[j].nodeValue;
                nodes = Object.assign(nodes, {[a]: b});
                if (a === 'ref') {
                  nodes = Object.assign(nodes, {title: b});
                }
              }
              nodes.parent = node;
              nodes.choice = node;
              childArr.push(nodes);
              if (data) {
                data.children = childArr;
              }
            }
          }
          return childArr;
        }
      }
      if (childs.length > 0) {
        if (childs[0].nodeValue !== 'NotEmptyType') {
          let childrenPath = '/xs:schema/xs:complexType[@name=\'' + childs[0].nodeValue + '\']/xs:sequence/xs:element';
          let sElement = select(childrenPath, this.doc);
          if (sElement.length > 0) {
            for (let i = 0; i < sElement.length; i++) {
              nodes = {};
              for (let j = 0; j < sElement[i].attributes.length; j++) {
                let a = sElement[i].attributes[j].nodeName;
                let b = sElement[i].attributes[j].nodeValue;
                nodes = Object.assign(nodes, {[a]: b});
                if (a === 'ref') {
                  nodes = Object.assign(nodes, {title: b});
                }
              }
              nodes.parent = node;
              childArr.push(nodes);
              if (data) {
                data.children = childArr;
              }
            }
          } else if ((select(complexContentWithElementPath, this.doc)).length > 0) {
            let childrenPath1 = '/xs:schema/xs:complexType[@name=\'' + childs[0].nodeValue + '\']/xs:choice/xs:element';
            let elementx = select(childrenPath1, this.doc);
            if (elementx.length > 0) {
              for (let i = 0; i < elementx.length; i++) {
                nodes = {};
                for (let j = 0; j < elementx[i].attributes.length; j++) {
                  let a = elementx[i].attributes[j].nodeName;
                  let b = elementx[i].attributes[j].nodeValue;
                  nodes = Object.assign(nodes, {[a]: b});
                  if (a === 'ref') {
                    nodes = Object.assign(nodes, {title: b});
                  }
                }
                nodes.parent = node;
                nodes.choice = node;
                childArr.push(nodes);
                if (data) {
                  data.children = childArr;
                }
              }
              let ele = select(complexContentWithElementPath, this.doc);
              for (let i = 0; i < ele.length; i++) {
                nodes = {};
                for (let j = 0; j < ele[i].attributes.length; j++) {
                  let a = ele[i].attributes[j].nodeName;
                  let b = ele[i].attributes[j].nodeValue;
                  nodes = Object.assign(nodes, {[a]: b});
                  if (a === 'ref') {
                    nodes = Object.assign(nodes, {title: b});
                  }
                }
                nodes.parent = node;
                childArr.push(nodes);
                if (data) {
                  data.children = childArr;
                }
              }
              return childArr;
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
            this.addTypeChildNode(typeElement[0].attributes[i].nodeValue, parentNode, data);
          }
          if (typeElement[0].attributes[i].nodeValue === 'xs:boolean') {
            nodes = Object.assign(nodes, {values: []});
            let temp: any = {};
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

  addTypeChildNode(node, parent, data) {
    let parentNode;
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let complexTypePath = '/xs:schema/xs:complexType[@name=\'' + node + '\']';
    let TypePath = '/xs:schema/xs:element[@name=\'' + node + '\']';
    let nodes: any = {};
    let childArr: any = [];
    let element = select(complexTypePath, this.doc);
    if (element.length > 0) {
      let sequencePath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence';
      let element1 = select(sequencePath, this.doc);
      if (element1.length > 0) {
        let childPath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence/xs:element';
        let childs = select(childPath, this.doc);
        if (childs.length > 0) {
          for (let i = 0; i < childs.length; i++) {
            nodes = {};
            for (let j = 0; j < childs[i].attributes.length; j++) {
              let a = childs[i].attributes[j].nodeName;
              let b = childs[i].attributes[j].nodeValue;
              nodes = Object.assign(nodes, {[a]: b});
              if (a === 'ref') {
                nodes = Object.assign(nodes, {title: b});
              }
            }
            nodes.parent = parent;
            childArr.push(nodes);
            if (data) {
              data.children = childArr;
            }
          }
        }
        let seqChoicePath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence/xs:choice/xs:element';
        let getChildChoice = select(seqChoicePath, this.doc);
        if (getChildChoice.length > 0) {
          for (let i = 0; i < getChildChoice.length; i++) {
            nodes = {};
            for (let j = 0; j < getChildChoice[i].attributes.length; j++) {
              let a = getChildChoice[i].attributes[j].nodeName;
              let b = getChildChoice[i].attributes[j].nodeValue;
              nodes = Object.assign(nodes, {[a]: b});
              if (a === 'ref') {
                nodes = Object.assign(nodes, {title: b});
              }
            }
            nodes.parent = parent;
            nodes.choice = parent;
            childArr.push(nodes);
            if (data) {
              data.children = childArr;
            }
          }
        }
        let seqChoiceSeqPath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence/xs:choice/xs:sequence/xs:element';
        let getChildChoiceSeq = select(seqChoiceSeqPath, this.doc);
        if (getChildChoiceSeq.length > 0) {
          for (let i = 0; i < getChildChoiceSeq.length; i++) {
            nodes = {};
            for (let j = 0; j < getChildChoiceSeq[i].attributes.length; j++) {
              let a = getChildChoiceSeq[i].attributes[j].nodeName;
              let b = getChildChoiceSeq[i].attributes[j].nodeValue;
              nodes = Object.assign(nodes, {[a]: b});
              if (a === 'ref') {
                nodes = Object.assign(nodes, {title: b});
              }
            }
            nodes.parent = parent;
            nodes.choice1 = parent;
            childArr.push(nodes);
            if (data) {
              data.children = childArr;
            }
          }
        }
        return childArr;
      }
      let choicePath = '//xs:complexType[@name=\'' + node + '\']/xs:choice';
      if ((select(choicePath, this.doc)).length) {
        let childPath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:choice/xs:element';
        let childs = select(childPath, this.doc);
        if (childs.length > 0) {
          for (let i = 0; i < childs.length; i++) {
            nodes = {};
            for (let j = 0; j < childs[i].attributes.length; j++) {
              let a = childs[i].attributes[j].nodeName;
              let b = childs[i].attributes[j].nodeValue;
              nodes = Object.assign(nodes, {[a]: b});
              if (a === 'ref') {
                nodes = Object.assign(nodes, {title: b});
              }
            }
            nodes.parent = parent;
            nodes.choice = parent;
            childArr.push(nodes);
            if (data) {
              data.children = childArr;
            }
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
            this.addTypeChildNode(typeElement[0].attributes[i].nodeValue, parentNode, undefined);
          }
        }
      }
    }
  }
}

@Component({
  selector: 'app-show-modal',
  templateUrl: './show-dialog.html'
})
export class ShowModalComponent implements OnInit {
  @Input() xml;
  @Input() objectType: any;
  @Input() schemaIdentifier;
  @Input() schedulerId;
  @Input() activeTab;
  prevErrLine;
  cmOptions: any = {
    lineNumbers: true,
    indentWithTabs: true,
    autoRefresh: true,
    mode: 'xml',
  };
  obj: any = {xml: ''};
  @ViewChild('codeMirror', {static: true}) cm;

  constructor(public activeModal: NgbActiveModal, public coreService: CoreService,
              private toasterService: ToasterService, private clipboardService: ClipboardService) {
  }

  ngOnInit(): void {
    this.obj.xml = this.xml;
  }

  copyToClipboard() {
    this.clipboardService.copyFromContent(this.obj.xml);
  }

  validateXML() {
    let obj: any = {
      controllerId: this.schedulerId,
      objectType: this.objectType,
      configuration: this.obj.xml
    };
    if (this.objectType !== 'NOTIFICATION') {
      obj.schemaIdentifier = this.activeTab.schemaIdentifier;
    }
    this.coreService.post('xmleditor/validate', obj).subscribe((res: any) => {
      if (res.validationError) {
        this.highlightLineNo(res.validationError.line);
        this.toasterService.pop('error', res.validationError.message);
      } else {
        this.toasterService.clear();
      }
    }, (error) => {
      if (error.error) {
        this.toasterService.pop('error', error.error.message);
      }
    });
  }

  cancel() {
    this.activeModal.close();
  }

  execCommand(type) {
    this.cm.codeMirror.execCommand(type);
  }

  submitXML() {
    let data = this.obj.xml;
    let obj: any = {
      controllerId: this.schedulerId,
      objectType: this.objectType,
      configuration: data
    };
    if (this.objectType !== 'NOTIFICATION') {
      obj.id = this.activeTab.id;
      obj.schemaIdentifier = this.schemaIdentifier;
      obj.name = this.activeTab.name;
    }
    this.coreService.post('xmleditor/apply', obj).subscribe((res: any) => {
      if (res.validationError) {
        this.highlightLineNo(res.validationError.line);
        this.toasterService.pop('error', res.ValidationError.message);
      } else {
        this.activeModal.close({result: res});
      }
    }, (error) => {
      console.error(error);
    });
  }

  private highlightLineNo(num) {
    let lNum = _.clone(num);
    let dom: any = document.getElementsByClassName('CodeMirror-code');
    if (dom && dom[0]) {
      if (num > dom[0].children.length) {
        $('.CodeMirror-scroll').animate({
          scrollTop: (17.8 * num)
        }, 500);
      }
      setTimeout(() => {
        dom = document.getElementsByClassName('CodeMirror-code');
        lNum = _.clone(num - parseInt(dom[0].children[0].innerText.split(' ')[0].split('↵')[0], 10) + 1);
        if (this.prevErrLine) {
          dom[0].children[this.prevErrLine - 1].classList.remove('bg-highlight');
          let x = dom[0].children[this.prevErrLine - 1];
          x.getElementsByClassName('CodeMirror-gutter-elt')[0].classList.remove('text-danger');
          x.getElementsByClassName('CodeMirror-gutter-elt')[0].classList.remove('bg-highlight');
        }
        if (dom[0].children[lNum - 1]) {
          dom[0].children[lNum - 1].classList.add('bg-highlight');
          let x = dom[0].children[lNum - 1];
          x.getElementsByClassName('CodeMirror-gutter-elt')[0].classList.add('text-danger');
          x.getElementsByClassName('CodeMirror-gutter-elt')[0].classList.add('bg-highlight');
          this.prevErrLine = _.clone(lNum);
        }
      }, 500);
    }
  }
}

@Component({
  selector: 'app-import-modal',
  templateUrl: './import-dialog.html'
})
export class ImportModalComponent implements OnInit {

  @Input() schedulerId: any;
  @Input() display: any;
  @Input() selectedPath: any;
  @Input() importObj;
  @Input() otherSchema;
  @Input() importXsd;
  uploader: FileUploader;
  fileLoading = false;
  messageList: any;
  required = false;
  submitted = false;
  comments: any = {};
  assignXsd: any;
  uploadData: any;

  constructor(public activeModal: NgbActiveModal,
              public modalService: NgbModal,
              public translate: TranslateService,
              public toasterService: ToasterService
  ) {
    this.uploader = new FileUploader({
      url: ''
    });
  }

  ngOnInit() {
    this.comments.radio = 'predefined';
    if (sessionStorage.comments) {
      this.messageList = JSON.parse(sessionStorage.comments);
    }
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
    }

    this.uploader.onCompleteItem = (fileItem: any, response, status, headers) => {
      if (status === 200) {
        this.activeModal.close('success');
      }
    };

    this.uploader.onErrorItem = (fileItem, response: any, status, headers) => {
      if (response.error) {
        this.toasterService.pop('error', response.error.code, response.error.message);
      }
    };
  }

  // import xml
  onFileSelected(event: any): void {
    let item = event['0'];
    let fileExt = item.name.slice(item.name.lastIndexOf('.') + 1).toUpperCase();
    if (!this.importXsd) {
      if (fileExt !== 'XML') {
        this.toasterService.pop('error', '', fileExt + ' ' + 'invalid file type');
        event.remove();
      } else {
        this.fileLoading = false;
        let reader = new FileReader();
        reader.readAsText(item, 'UTF-8');
        reader.onload = (_event: any) => {
          this.uploadData = _event.target.result;
          if (this.uploadData !== undefined && this.uploadData !== '') {
          } else {
            this.toasterService.pop('error', 'Invalid xml file or file must be empty');
          }
        };
      }
    } else if (this.importXsd) {
      if (fileExt !== 'XSD') {
        this.toasterService.pop('error', '', fileExt + ' ' + 'invalid file type');
        event.remove();
      } else {
        this.fileLoading = false;
        let reader = new FileReader();
        reader.readAsText(item, 'UTF-8');
        reader.onload = (_event: any) => {
          this.uploadData = _event.target.result;
          if (this.uploadData !== undefined && this.uploadData !== '') {
          } else {
            this.toasterService.pop('error', 'Invalid xml file or file must be empty');
          }
        };
      }
    }
  }

  // submit data
  onSubmit() {
    if (!this.importXsd) {
      this.activeModal.close({uploadData: this.uploadData, importObj: this.importObj});
    } else {
      this.activeModal.close({uploadData: this.uploadData, _file: {name: this.uploader.queue[0]._file.name}});
    }
  }

  cancel() {
    this.activeModal.close('');
  }
}

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-dialog.html'
})
export class ConfirmationModalComponent {
  @Input() save;
  @Input() self;
  @Input() assignXsd;
  @Input() delete;
  @Input() deleteAll;
  @Input() objectType;
  @Input() activeTab;

  constructor(public activeModal: NgbActiveModal) {
  }

  confirmMessage(message) {
    if (message === 'yes') {
      if (!this.delete && this.save) {
        this.save(this.self);
        this.activeModal.close('success');
      } else {
        this.activeModal.close('success');
      }
    } else {
      if (this.delete || this.deleteAll) {
        this.activeModal.dismiss();
      } else {
        this.assignXsd(this.self);
        this.activeModal.close('success');
      }
    }
  }
}


@Component({
  selector: 'app-diff-modal',
  templateUrl: './diff-dialog.html'
})
export class DiffPatchModalComponent {
  @Input() liveXml;
  @Input() draftXml;
  @Input() xmlVersionObj;

  constructor(public activeModal: NgbActiveModal) {
  }

  checkBoxCheck(data) {
    if (data === 'liveVersion') {
      this.xmlVersionObj = {draftVersion: false, liveVersion: true};
    } else {
      this.xmlVersionObj = {draftVersion: true, liveVersion: false};
    }
  }

  ok() {
    this.activeModal.close({xmlVersionObj: this.xmlVersionObj});
  }

  cancel() {
    this.activeModal.dismiss();
  }
}

@Component({
  selector: 'app-xml',
  templateUrl: './xml-editor.component.html',
  styleUrls: ['./xml-editor.component.scss']
})
export class XmlEditorComponent implements OnInit, OnDestroy, AfterViewInit {
  public Editor = ClassicEditor;
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  isLoading = true;
  options: any = {};
  doc: any;
  nodes: any = [];
  showAllChild: any = [];
  xsdXML: any;
  isNext = false;
  counting = 0;
  autoAddCount = 0;
  copyItem: any = {};
  cutData = false;
  checkRule = true;
  choice = true;
  dropCheck: any = {status: false, dropNode: undefined};
  selectedNode: any;
  selectedXsd = '';
  submitXsd = false;
  submitted;
  errorLocation: any;
  childNode: any = [];
  myContent: string;
  value: any = [];
  count = 1;
  error = false;
  errorName;
  tempArr: any = [];
  text;
  subscription: Subscription;
  validConfig = false;
  nonValidattribute: any = {};
  keyRefNodes;
  keyNodes;
  breadCrumbArray: any = [];
  refElement;
  // new
  objectType;
  XSDState: any = {};
  schemaIdentifier;
  isExpandAll = false;
  isDeploy = false;
  path;
  prevXML;
  recreateJsonFlag;
  lastScrollId;
  _xml;
  objectXml: any = {};
  otherSchema: any = [];
  importObj: any = {};
  editorOptions: any = {readOnly: true};
  activeTab: any = {};
  deleteAll: boolean;
  delete: boolean;
  tabsArray = [];
  oldName: string;
  tab: any;
  showSelectSchema: any;
  _activeTab: any;
  reassignSchema: boolean;
  importXSDFile: boolean;
  sideView: any = {};
  uploadData: any;
  xmlVersionObj: any;
  draftXml: any;
  liveXml: any;
  selectedTabIndex = 0;
  counter: number;
  intervalId: any;
  requiredField: string;
  spaceNotAllowed: string;
  cannotAddBlankSpace: string;
  onlyPositiveNumbers: string;
  cannotNegative: string;
  colonNotAllowed: string;
  notValidUrl: string;
  uniqueName: string;
  onlyNumbers: string;
  config: any = {
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
    ], allowedContent: true
  };

  @ViewChild('myckeditor', {static: false}) ckeditor: any;
  @ViewChild('treeCtrl', {static: false}) treeCtrl: any;

  constructor(
    public coreService: CoreService,
    private modalService: NgbModal,
    private dataService: DataService,
    public translate: TranslateService,
    public toasterService: ToasterService,
    private router: Router,
    private authService: AuthService
  ) {
    this.myContent = '';
    this.subscription = this.dataService.functionAnnounced$.subscribe(res => {
      this.gotoErrorLocation();
    });
  }

  ngOnInit() {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if (sessionStorage.preferences) {
      this.permission = JSON.parse(this.authService.permission) || {};
    }
    this.sideView = this.coreService.getSideView();
    if (this.sideView.xml && !this.sideView.xml.show) {
      this.hidePanel();
    }
    let url = this.router.url.split('/')[2];
    this.objectType = url.toUpperCase();
    if (this.objectType === 'FILE_TRANSFER') {
      this.objectType = 'YADE';
    }
    if (url === 'notification') {
      this.selectedXsd = 'systemMonitorNotification';
    }
    if (this.objectType === 'NOTIFICATION') {
      if(this.selectedXsd !== '')
      this.readXML();
    } else {
      this.othersXSD();
    }
    this.intervalId = setInterval(() => {
      if (this.submitXsd && !this.objectXml.xml) {
        this.storeXML(undefined);
      }
    }, 30000);

    this.translate.get('xml.message.requiredField').subscribe(translatedValue => {
      this.requiredField = translatedValue;
    });
    this.translate.get('xml.message.uniqueError').subscribe(translatedValue => {
      this.uniqueName = translatedValue;
    });
    this.translate.get('xml.message.spaceNotAllowed').subscribe(translatedValue => {
      this.spaceNotAllowed = translatedValue;
    });
    this.translate.get('xml.message.cannotAddBlankSpace').subscribe(translatedValue => {
      this.cannotAddBlankSpace = translatedValue;
    });
    this.translate.get('xml.message.onlyPositiveNumbers').subscribe(translatedValue => {
      this.onlyPositiveNumbers = translatedValue;
    });
    this.translate.get('xml.message.cannotNegative').subscribe(translatedValue => {
      this.cannotNegative = translatedValue;
    });
    this.translate.get('xml.message.colonNotAllowed').subscribe(translatedValue => {
      this.colonNotAllowed = translatedValue;
    });
    this.translate.get('xml.message.onlyNumbers').subscribe(translatedValue => {
      this.onlyNumbers = translatedValue;
    });
    this.translate.get('xml.message.notValidUrl').subscribe(translatedValue => {
      this.notValidUrl = translatedValue;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.coreService.setSideView(this.sideView);
    clearInterval(this.intervalId);
    this.coreService.tabs._configuration.state = this.objectType === 'YADE' ? 'file_transfer' : this.objectType.toLowerCase();
  }


  deleteAllConf() {
    this.deleteAll = true;
    this.delete = false;
    let modalRef = this.modalService.open(ConfirmationModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.deleteAll = true;
    modalRef.componentInstance.objectType = this.objectType;
    modalRef.result.then((res) => {
      let obj = {
        controllerId: this.schedulerIds.selected,
        objectTypes: [this.objectType],
      };
      this.coreService.post('xmleditor/delete/all', obj).subscribe(() => {
        this.tabsArray = [];
        this.nodes = [];
        this.selectedNode = [];
        this.submitXsd = false;
        this.isLoading = false;
        this.XSDState = '';
        this.schemaIdentifier = '';
      });
      this.deleteAll = false;
    }, () => {
      this.deleteAll = false;
    });
  }

  openFolder(data: NzTreeNode | NzFormatEmitEvent): void {
    if (data instanceof NzTreeNode) {
      data.isExpanded = !data.isExpanded;
    } else {
      let node = data.node;
      if (node) {
        node.isExpanded = !node.isExpanded;
      }
    }
  }

  //delete config
  deleteConf() {
    this.delete = true;
    this.deleteAll = false;
    let modalRef = this.modalService.open(ConfirmationModalComponent, {backdrop: 'static', size: 'sm'});
    modalRef.componentInstance.delete = this.delete;
    modalRef.componentInstance.deleteAll = this.deleteAll;
    modalRef.componentInstance.objectType = this.objectType;
    if (this.objectType !== 'NOTIFICATION') {
      modalRef.componentInstance.activeTab = this.activeTab;
    }
    modalRef.result.then((res: any) => {
      this.del();
      this.delete = false;
    }, () => {
      this.delete = false;
    });
  }

  deployXML() {
    this.autoValidate();
    this._xml = this._showXml();
    if (_.isEmpty(this.nonValidattribute)) {
      this.coreService.post('xmleditor/deploy', {
        controllerId: this.schedulerIds.selected,
        objectType: this.objectType,
        configuration: this._xml,
        configurationJson: JSON.stringify({nodesCount: this.counting, node: this.nodes}),
      }).subscribe((res: any) => {
        if (res.validationError) {
          this.showError(res.validationError);
        } else {
          this.prevXML = this._xml;
          this.isDeploy = true;
          this.XSDState = Object.assign({}, {message: res.message});
          this.validConfig = true;
          if (res.deployed) {
            this.XSDState.modified = res.deployed;
          }
        }
      }, (error) => {
        this.toasterService.pop('error', error.error.message);
      });
    } else {
      this.gotoErrorLocation();
      this.popToast(this.nonValidattribute);
      if (this.nonValidattribute.name) {
        this.validateAttr('', this.nonValidattribute);
      }
    }
  }

  changeTab(data, isStore) {
    if (this.activeTab.id !== data.id) {
      if (this.activeTab.id < 0 || isStore) {
        this.activeTab = data;
        this.readOthersXSD(data.id);
      } else {
        this.storeXML(() => {
          this.activeTab = data;
          this.readOthersXSD(data.id);
        });
      }
    }
    this.validConfig = false;
  }

  hideDocumentation(data) {
    data.show = !data.show;
  }

  othersXSD() {
    this.submitXsd = false;
    this.coreService.post('xmleditor/read', {
      controllerId: this.schedulerIds.selected,
      objectType: this.objectType
    }).subscribe((res: any) => {
      if (res.schemas) {
        this.otherSchema = res.schemas;
        if (this.objectType === 'OTHER') {
          localStorage.setItem('schemas', this.otherSchema);
        } else {
          localStorage.setItem('yadeSchema', this.otherSchema);
        }
      }
      if (!res.configurations) {
        this.tabsArray = [];
        this.isLoading = false;
      } else {
        this.tabsArray = _.clone(res.configurations);
        this.activeTab = this.tabsArray[length - 1];
        this.readOthersXSD(this.activeTab.id);
      }
    }, (error) => {
      this.isLoading = false;
      this.tabsArray = [];
      this.error = true;
      if (error.error) {
        this.toasterService.pop('error', error.error.message);
      }
    });
  }

  readOthersXSD(id) {
    this.nodes = [];
    this.selectedNode = [];
    this.coreService.post('xmleditor/read', {
      controllerId: this.schedulerIds.selected,
      objectType: this.objectType,
      id: id
    }).subscribe((res: any) => {
      if (!res.configuration) {
        this.showSelectSchema = true;
        this.submitXsd = false;
        this.schemaIdentifier = undefined;
        this.otherSchema = res.schemas;
        if (this.objectType === 'OTHER') {
          localStorage.setItem('schemas', this.otherSchema);
        } else {
          localStorage.setItem('yadeSchema', this.otherSchema);
        }
      } else {
        this.showSelectSchema = false;
        if (!this.ok(res.configuration.configuration)) {
          this.doc = new DOMParser().parseFromString(res.configuration.schema, 'application/xml');
          this.path = res.configuration.schema;
          this.schemaIdentifier = res.configuration.schemaIdentifier;
          this.submitXsd = true;
          this.prevXML = this.removeComment(res.configuration.configuration);
          if (res.configuration.configurationJson) {
            let _tempArrToExpand = [];
            let a;
            try {
              a = JSON.parse(res.configuration.configurationJson);
            } catch (error) {
              this.isLoading = false;
              this.submitXsd = false;
            }
            if (!res.configuration.recreateJson) {
              this.counting = _.clone(a.nodesCount);
              this.nodes = a.node;
            } else {
              this.counting = a.lastUuid;
              this.nodes = [a];
              this.getIndividualData(this.nodes[0], undefined);
              this.handleNodeToExpandAtOnce(this.nodes, null, _tempArrToExpand);
            }
            this.isLoading = false;
            this.selectedNode = this.nodes[0];
            this.XSDState = {modified : res.configuration.modified};
            this.storeXML(undefined);
            this.printArraya(false);
            if (_tempArrToExpand && _tempArrToExpand.length > 0) {
              setTimeout(function () {
                for (let i = 0; i < _tempArrToExpand.length; i++) {
                  _tempArrToExpand[i].expanded = true;
                }
              }, 10);
            }

          } else {
            this.nodes = [];
            this.isLoading = true;
            this.loadTree(res.configuration.schema, true);
            setTimeout(function () {
              // createJSONFromXML(res.configuration.configuration);
            }, 600);
          }
          if (this.objectType !== 'NOTIFICATION' && this._activeTab) {
            this._activeTab.isVisible = false;
          }
        } else {
          this.openXMLDialog(res.configuration.configuration);
        }
      }
    }, (err) => {
      this.submitXsd = false;
      this.isLoading = false;
      this.XSDState = '';
      this.error = true;
      this.toasterService.pop('error', err.data.error.message);
    });
  }

  cancelReassignSchema() {
    this.reassignSchema = false;
    this.submitXsd = true;
    this.showSelectSchema = false;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.calcHeight();
    }, 1);
  }

  // Expand all Node
  private expandCollapseRec(node, flag) {
    for (let i = 0; i < node.length; i++) {
      if (node[i].children && node[i].children.length > 0) {
        node[i].expanded = flag;
        this.expandCollapseRec(node[i].children, flag);
      }
    }
    this.updateTree();
  }

  expandAll() {
    this.isExpandAll = true;
    this.updateTree();
  }

  collapseAll() {
    this.isExpandAll = false;
    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i].expanded = false;
      if (this.nodes[i].children && this.nodes[i].children.length > 0) {
        this.expandCollapseRec(this.nodes[i].children, false);
      }
    }
  }

  updateTree() {
    this.nodes = [...this.nodes];
  }

  // change selected xsd value
  changeXSD(value) {
    this.selectedXsd = value;
  }

  // submit xsd to open
  submit() {
    if (this.selectedXsd !== '') {
      sessionStorage.$SOS$XSD = this.selectedXsd;
      this.readXML();
      this.submitXsd = true;
      // this.getInitTree(false);
    }
  }

  readXML() {
    this.selectedXsd = this.selectedXsd.toUpperCase();
    let obj = {
      controllerId: this.schedulerIds.selected,
      objectType: this.objectType
    };
    this.coreService.post('xmleditor/read', obj).subscribe((res: any) => {
      this.schemaIdentifier = res.schemaIdentifier;
      this.path = res.schema;
      this.XSDState = res.state;
      this.submitXsd = true;
      this.isDeploy = res.state.deployed;
      this.XSDState.modified = res.modified;
      this.doc = new DOMParser().parseFromString(this.path, 'application/xml');
      if (res.configurationJson) {
        let _tempArrToExpand = [];
        this.prevXML = this.removeComment(res.configuration);
        let jsonArray;
        try {
          jsonArray = JSON.parse(res.configurationJson);
        } catch (e) {
          this.isLoading = false;
          this.submitXsd = false;
        }
        this.recreateJsonFlag = res.recreateJson;
        if (!res.recreateJson) {
          this.nodes = [];
          this.handleNodeToExpandAtOnce(jsonArray.node, undefined, _tempArrToExpand);
          this.nodes = jsonArray.node;
          this.counting = _.clone(jsonArray.nodesCount);
        } else {
          let a = [jsonArray];
          this.counting = jsonArray.lastUuid;
          this.nodes = a;
          this.getIndividualData(this.nodes[0], undefined);
          this.selectedNode = this.nodes[0];
        }
        this.isLoading = false;
        this.selectedNode = this.nodes[0];
        this.selectedNode.expanded = true;
        this.autoExpand(this.selectedNode);
        if (_tempArrToExpand && _tempArrToExpand.length > 0) {
          setTimeout(() => {
            for (let i = 0; i < _tempArrToExpand.length; i++) {
              _tempArrToExpand[i].expanded = true;
              this.autoExpand(_tempArrToExpand[i]);
            }
          }, 10);
        }
        this.printArraya(false);
      } else if (res.configuration) {
        if (!this.ok(res.configuration)) {
          this.nodes = [];
          this.isLoading = true;
          this.XSDState = res.state;
          this.submitXsd = true;
          this.isDeploy = res.state.deployed;
          this.XSDState.modified = res.modified;
          this.prevXML = this.removeComment(res.configuration);
          this.loadTree(this.path, true);
          setTimeout(() => {
            this.createJsonfromXml(res.configuration);
            if (res.state.deployed) {
              this.validConfig = true;
            }
          }, 600);
        } else {
          this.submitXsd = false;
          this.isLoading = false;
          this.XSDState = res.state;
          this.XSDState.modified = res.modified;
          // openXMLDialog(res.configuration);
        }
      } else {
        this.submitXsd = false;
        this.isLoading = false;
        this.XSDState = res.state;
        this.XSDState = Object.assign(this.XSDState, {warning: res.warning});
      }
    });
  }

  checkOrder(node) {
    setTimeout(() => {
      if (node && this.childNode.length > 0) {
        if (this.childNode && this.childNode.length > 0 && node && node.children && node.children.length > 0) {
          for (let j = 0; j < node.children.length; j++) {
            for (let i = 0; i < this.childNode.length; i++) {
              if (this.childNode[i].ref === node.children[j].ref) {
                node.children[j].order = i;
                break;
              }
            }
          }
        }
      }
      this.getNodeRulesData(node);
    }, 10);
  }

  getIndividualData(node, scroll) {
    let attrs = this.checkAttributes(node.ref);
    if (attrs && attrs.length > 0) {
      if (node.attributes && node.attributes.length > 0) {
        for (let i = 0; i < attrs.length; i++) {
          for (let j = 0; j < node.attributes.length; j++) {
            this.checkAttrsValue(attrs[i]);
            this.checkAttrsText(attrs[i]);
            if (attrs[i].name === node.attributes[j].name) {
              attrs[i] = Object.assign(attrs[i], node.attributes[j]);
            }
          }
        }
      }
    }
    let value = this.getValues(node.ref);
    if (node.values && node.values.length > 0) {
      for (let i = 0; i < value.length; i++) {
        for (let j = 0; j < node.values.length; j++) {
          if (value[i].parent === node.values[j].parent) {
            value[i] = Object.assign(value[i], node.values[j]);
          }
        }
      }
    }
    let attrsType = this.getAttrFromType(node.ref, node.parent);
    if (attrsType && attrsType.length > 0) {
      if (node.attributes && node.attributes.length > 0) {
        for (let i = 0; i < attrsType.length; i++) {
          for (let j = 0; j < node.attributes.length; j++) {
            if (attrsType[i].name === node.attributes[j].name) {
              attrsType[i] = Object.assign(attrsType[i], node.attributes[j]);
            }
          }
        }
      }
    }
    let valueType = this.getValueFromType(node.ref, node.parent);

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
    let val = this.getVal(node);
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
      val = this.getValFromDefault(node);
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
      this.attachAttrs(attrs, node);
    }
    if (!(_.isEmpty(val))) {
      node.values = _.clone([]);
      for (let j = 0; j < val.length; j++) {
        val[j].uuid = this.counting;
        val[j].key = this.counting;
        this.counting++;
        if (val[j].base === 'password') {
          val[j].pShow = false;
        }
        if (node && node.values) {
          node.values = _.clone([]);
          node.values.push(val[j]);
        }
      }
    }
    if (!(_.isEmpty(value))) {
      node.values = [];
      for (let j = 0; j < value.length; j++) {
        value[j].uuid = this.counting;
        value[j].key = this.counting;
        this.counting++;
        if (value[j].base === 'password') {
          value[j].pShow = false;
        }
        if (node && node.values) {
          node.values = _.clone([]);
          node.values.push(value[j]);
        }
      }
    }
    if (valueType !== undefined) {
      for (let j = 0; j < valueType.length; j++) {
        valueType[j].uuid = this.counting;
        valueType[j].key = this.counting;
        this.counting++;
        if (valueType[j].base === 'password') {
          valueType[j].pShow = false;
        }
        if (node && node.values) {
          node.values = _.clone([]);
          node.values.push(valueType[j]);
        }
      }
    }
    if (attrsType !== undefined) {
      for (let j = 0; j < attrsType.length; j++) {
        for (let i = 0; i < node.attributes.length; i++) {
          if (attrsType[j].name !== node.attributes[i].name) {
            attrsType[j].uuid = this.counting;
            attrsType[j].key = this.counting;
            this.counting++;
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
      this.printArraya(false);
      node.recreateJson = true;
    } else {
      this.printArraya(false);
    }
    if (scroll) {
      this.scrollTreeToGivenId(this.selectedNode.uuid);
    }
  }

  scrollTreeToGivenId(id) {
    if (this.lastScrollId !== id) {
      this.lastScrollId = _.clone(id);
    }
    this.scrollTree(id, () => {
      if (this.selectedNode) {
        this.selectedNode.expanded = true;
        this.autoExpand(this.selectedNode);
      }
      this.getParentToExpand(this.selectedNode);
      this.selectedNode.expanded = true;
      this.autoExpand(this.selectedNode);
      setTimeout(() => {
        this.scrollTree(this.selectedNode.uuid, undefined);
      }, 0);
    });
  }

  getParentToExpand(node) {
    if (node.parent === '#') {
      this.autoExpand(this.nodes[0]);

    } else {
      let someNode = this.treeCtrl.getTreeNodeByKey(node.parentId);
      if (someNode) {
        this.autoExpand(someNode.origin);
      }
      if (someNode && someNode.origin && someNode.origin.parent !== '#') {
        this.getParentToExpand(someNode.origin);
      }
    }
  }

  ok(conf) {
    let dom_parser = new DOMParser();
    let dom_document = dom_parser.parseFromString(conf, 'text/xml');
    try {
      if (dom_document.documentElement.getElementsByTagName('parsererror').length > 0
        || dom_document.documentElement.nodeName === 'parsererror') {
        if (dom_document.documentElement.getElementsByTagName('parsererror').length > 0) {
          let a: any = dom_document.documentElement.getElementsByTagName('parsererror')[0];
          this.toasterService.pop('error', 'Invalid xml ' + a.innerText);
        } else {
          this.toasterService.pop('error', 'Invalid xml ' + dom_document.documentElement.firstChild.nodeValue);
        }
        return true;
      } else {
        return false;
      }
    } catch (e) {
      let a: any = dom_document.documentElement.getElementsByTagName('parsererror')[0];
      this.toasterService.pop('error', 'Invalid xml ' + a.innerText, e);
      return true;
    }
  }

  loadTree(xml, check) {
    this.doc = new DOMParser().parseFromString(xml, 'application/xml');
    this.getRootNode(this.doc, check);
    this.xsdXML = xml;
    this.xpath();
    this.AddKeyReferencing();
    this.selectedNode = this.nodes[0];
    this.getData(this.nodes[0]);
    this.isLoading = !!check;
  }

  reassignSchemaa() {
    this.reassignSchema = true;
    this.submitXsd = false;
    this.showSelectSchema = true;
    this.selectedXsd = (this.schemaIdentifier) ? this.schemaIdentifier : this.selectedXsd;
    if (this.objectType === 'OTHER') {
      this.otherSchema = localStorage.getItem('schemas').split(',');
    } else {
      this.otherSchema = localStorage.getItem('yadeSchema').split(',');
    }
  }

  getRootNode(doc, check) {
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
    temp.key = this.counting;
    temp.expanded = true;
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
    if (!check) {
      child = this.checkChildNode(temp, undefined);

      if (child && child.length > 0) {
        for (let i = 0; i < child.length; i++) {
          if (child[i].minOccurs === undefined) {
            if (!temp.children) {
              temp.children = [];
            }
            this.addChild(child[i], temp, true, i);
          }
        }
      }
    }
    this.printArray(temp);
  }

  checkAttributes(node) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let complexTypePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType';
    let attribute: any = {};
    let attrsArr: any = [];
    let element = select(complexTypePath, this.doc);
    if (element && element.length > 0) {
      this._checkAttributes('/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:attribute', attribute, node, attrsArr, select);
      this._checkAttributes('/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:complexContent/xs:extension/xs:attribute', attribute, node, attrsArr, select);
      this._checkAttributes('/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:simpleContent/xs:extension/xs:attribute', attribute, node, attrsArr, select);
    }
    return attrsArr;
  }

  _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {value: value, enumerable: true, configurable: true, writable: true});
    } else {
      obj[key] = value;
    }
    return obj;
  }

  _checkAttributes(attrsPath, attribute, node, attrsArr, select) {
    var attrs = select(attrsPath, this.doc);

    if (attrs.length > 0) {
      for (var i = 0; i < attrs.length; i++) {
        attribute = {};
        var x = void 0;

        for (var j = 0; j < attrs[i].attributes.length; j++) {
          var a = attrs[i].attributes[j].nodeName;
          var b = attrs[i].attributes[j].nodeValue;
          attribute = Object.assign(attribute, this._defineProperty({}, a, b));
          var valueFromXmlEditorPath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:attribute[@name=\''
            + b + '\']/xs:annotation/xs:appinfo/XmlEditor';
          var attr1 = select(valueFromXmlEditorPath, this.doc);

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

  checkChildNode(showAllChild, data) {
    let node = showAllChild.ref;
    let parentNode;
    if (!data) {
      this.childNode = [];
    }
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let complexTypePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType';
    let TypePath = '/xs:schema/xs:element[@name=\'' + node + '\']';
    let nodes: any = {};
    let childArr: any = [];
    let element = select(complexTypePath, this.doc);
    if (element.length > 0) {
      let sequencePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence';
      let choicePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:choice';
      let childFromBasePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:complexContent/xs:extension/@base';
      let complexContentWithElementPath = '/xs:schema/xs:element[@name=\'' + node
        + '\']/xs:complexType/xs:complexContent/xs:extension/xs:sequence/xs:element';
      let childs = select(childFromBasePath, this.doc);
      let element1 = select(sequencePath, this.doc);
      if (element1.length > 0) {
        let cPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:element';
        let cElement = select(cPath, this.doc);
        let dPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:choice/xs:element';
        let dElement = select(dPath, this.doc);
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
            if (data) {
              data.children = childArr;
            } else {
              this.childNode = childArr;
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
            if (data) {
              data.children = childArr;
            } else {
              this.childNode = childArr;
            }
          }
        }
        let ePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:choice/xs:sequence/xs:element';
        let eElement = select(ePath, this.doc);
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
            if (data) {
              data.children = childArr;
            } else {
              this.childNode = childArr;
            }
          }
        }
        return childArr;
      }
      if ((select(choicePath, this.doc)).length > 0) {
        let childPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:choice/xs:element';
        let childs1 = select(childPath, this.doc);
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
            if (data) {
              data.children = childArr;
            } else {
              this.childNode = childArr;
            }
          }
          let childPath2 = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:choice/xs:sequence/xs:element';
          let child12 = select(childPath2, this.doc);
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
              if (data) {
                data.children = childArr;
              } else {
                this.childNode = childArr;
              }
            }
          }
          return childArr;
        }
      }
      if (childs.length > 0) {
        if (childs[0].nodeValue !== 'NotEmptyType') {
          let childrenPath = '/xs:schema/xs:complexType[@name=\'' + childs[0].nodeValue + '\']/xs:sequence/xs:element';
          let sElement = select(childrenPath, this.doc);
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
              if (data) {
                data.children = childArr;
              } else {
                this.childNode = childArr;
              }
            }
          } else if ((select(complexContentWithElementPath, this.doc)).length > 0) {
            let childrenPath1 = '/xs:schema/xs:complexType[@name=\'' + childs[0].nodeValue + '\']/xs:choice/xs:element';
            let elementx = select(childrenPath1, this.doc);
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
                if (data) {
                  data.children = childArr;
                } else {
                  this.childNode = childArr;
                }
              }
              let ele = select(complexContentWithElementPath, this.doc);
              for (let i = 0; i < ele.length; i++) {
                nodes = {};
                for (let j = 0; j < ele[i].attributes.length; j++) {
                  let a = ele[i].attributes[j].nodeName;
                  let b = ele[i].attributes[j].nodeValue;
                  nodes = Object.assign(nodes, {[a]: b});
                }
                nodes.parent = node;
                childArr.push(nodes);
                if (data) {
                  data.children = childArr;
                } else {
                  this.childNode = childArr;
                }
              }
              return childArr;
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
            this.addTypeChildNode(typeElement[0].attributes[i].nodeValue, parentNode, data);
          }
          if (typeElement[0].attributes[i].nodeValue === 'xs:boolean') {
            nodes = Object.assign(nodes, {values: []});
            let temp: any = {};
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

  getAttrFromType(nodeValue, parentNode) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let attrTypePath = '/xs:schema/xs:element[@name=\'' + nodeValue + '\']/@type';
    let element = select(attrTypePath, this.doc);
    let attribute: any = {};
    if (element.length > 0) {
      let ele = select(attrTypePath, this.doc);
      let x;
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
    let attrTypePath = '/xs:schema/xs:complexType[@name=\'' + node.type + '\']/xs:simpleContent/xs:extension/xs:attribute/@*';
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
    // tslint:disable-next-line: max-line-length
    let valueTypePath = '//xs:complexType[@name=\'' + node.type + '\']/xs:simpleContent/xs:extension/xs:attribute[@name=\'' + attr.name + '\']/xs:simpleType/xs:restriction/xs:enumeration';
    let element = select(valueTypePath, this.doc);
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

  getValFromDefault(node) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let attrTypePath = '/xs:schema/xs:element[@name=\'' + node.ref + '\']/@default';
    let ele = select(attrTypePath, this.doc);
    let valueArr: any = [];
    let value: any = {};
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

  getVal(nodeValue) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let attrTypePath = '/xs:schema/xs:element[@name=\'' + nodeValue.ref + '\']/@type';
    let ele = select(attrTypePath, this.doc);
    let valueArr: any = [];
    let value: any = {};
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

  getValueFromType(nodeValue, parentNode) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let attrTypePath = '/xs:schema/xs:element[@name=\'' + nodeValue + '\']/@type';
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
    let extensionTypePath = '/xs:schema/xs:complexType[@name=\'' + node.type + '\']/xs:simpleContent/xs:extension/@*';
    let element = select(extensionTypePath, this.doc);
    let value: any = {};
    let valueArr: any = [];
    let b;
    if (element.length > 0) {
      if (element[0] && element[0].nodeValue === 'NotEmptyType') {
        let a = element[0].nodeName;
        let x = element[0].nodeValue;
        value = Object.assign(value, this._defineProperty({}, a, x));
        let simpleTypePath = '/xs:schema/xs:simpleType[@name=\'' + value.base + '\']/xs:restriction/@*';
        element = select(simpleTypePath, this.doc);
        if (element.length > 0) {
          a = element[0].nodeName;
          b = element[0].nodeValue;
          value = Object.assign(value, this._defineProperty({}, a, b));
          let minLengthPath = '/xs:schema/xs:simpleType[@name=\'' + x + '\']/xs:restriction/xs:minLength/@*';
          element = select(minLengthPath, this.doc);
          a = element[0].nodeName;
          b = element[0].nodeValue;
          value = Object.assign(value, this._defineProperty({}, a, b));
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
    let text: any = {};
    let documentationPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:annotation/xs:documentation/@*';
    let element = select(documentationPath, this.doc);
    if (element.length > 0) {
      for (let i = 0; i < element.length; i++) {
        let a = element[i].nodeName;
        let b = element[i].nodeValue[0].innerHTML;
        text = Object.assign(text, this._defineProperty({}, a, b));
      }
    } else {
      let documentationPath1 = '/xs:schema/xs:element[@ref=\'' + node + '\']/xs:annotation/xs:documentation/@*';
      let element1 = select(documentationPath1, this.doc);
      for (let i = 0; i < element1.length; i++) {
        let a = element1[i].nodeName;
        let b = element1[i].nodeValue[0].innerHTML;
        text = Object.assign(text, this._defineProperty({}, a, b));
      }
    }
    let documentationPath2 = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:annotation/xs:documentation';
    let element2 = select(documentationPath2, this.doc);
    if (element2.length > 0) {
      text.doc = element2[0].innerHTML;
    }
    text.parent = node;
    return text;
  }

  async checkDupProfileId(value, tag) {
    if (tag.name === 'profile_id' && this.selectedNode.ref == 'Profile') {
      let tempParentNode: any = await this.getParentNode(this.selectedNode);
      if (tempParentNode && tempParentNode.children && tempParentNode.children.length > 0) {
        for (let i = 0; i < tempParentNode.children.length; i++) {
          if (tempParentNode.children[i].attributes) {
            for (let j = 0; j < tempParentNode.children[i].attributes.length; j++) {
              if (tempParentNode.children[i].uuid !== this.selectedNode.uuid && tempParentNode.children[i].attributes[j].id !== tag.id) {
                if (tempParentNode.children[i].attributes[j].data === value) {
                  this.error = true;
                  this.errorName = tag.name;
                  this.text = tag.name + ': ' + this.uniqueName;
                  if (tag.data !== undefined) {
                    for (let key in tag) {
                      if (key === 'data') {
                        delete tag[key];
                      }
                    }
                  }
                  break;
                }
              }
            }
          }
          if (this.error) {
            break;
          }
        }
        if (!this.error) {
          tag = Object.assign(tag, {data: value});
          this.autoValidate();
        }
      }
    }
  }

  getParentNode(node) {
    let x = this.treeCtrl.getTreeNodeByKey(node.key);
    let parent = x.getParentNode();
    if (parent && parent.origin.parent !== '#') {
      parent.origin.expanded = true;
      this.updateTree();
    }
    return parent.origin;
  }

  async expandParentNodesOfSelectedNode(node) {
    if (node.parent !== '#') {
      let tempParentNode: any = await this.getParentNode(node);
      if (tempParentNode.parent !== '#') {
        await this.expandParentNodesOfSelectedNode(tempParentNode);
      }
    }
  }

  getFirstNotEmptyAttribute(attrs) {
    if (attrs && attrs.length > 0) {
      for (let i = 0; i < attrs.length; i++) {
        if (attrs[i].data) {
          return attrs[i].name + '=' + attrs[i].data;
        }
      }
    } else {
      return '';
    }
  }

  checkAttrsText(node) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let textAttrsPath = '/xs:schema/xs:element[@name=\'' + node.parent + '\']/xs:complexType/xs:attribute[@name=\''
      + node.name + '\']/xs:annotation/xs:documentation';
    let element = select(textAttrsPath, this.doc);
    let text: any = {};
    if (element.length > 0) {
      text.doc = element;
      node.text = text;
    }
    if (element.length === 0) {
      let textAttrsPath2 = '/xs:schema/xs:element[@name=\'' + node.parent + '\']/xs:complexType/xs:simpleContent/xs:extension/xs:attribute[@name=\''
        + node.name + '\']/xs:annotation/xs:documentation';
      text.doc = select(textAttrsPath2, this.doc);
      node.text = text;
      if (text.length <= 0) {
        let textAttrsPath1 = '/xs:schema/xs:element[@name=\'' + node.parent + '\']/xs:complexType/xs:complexContent/xs:extension/xs:attribute[@name=\''
          + node.name + '\']/xs:annotation/xs:documentation';
        text.doc = select(textAttrsPath1, this.doc);
        if (text.doc) {
          node.text = text;
        }
      }
    }
  }

  addTypeChildNode(node, parent, data) {
    let parentNode;
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let complexTypePath = '/xs:schema/xs:complexType[@name=\'' + node + '\']';
    let TypePath = '/xs:schema/xs:element[@name=\'' + node + '\']';
    let nodes: any = {};
    let childArr: any = [];
    let element = select(complexTypePath, this.doc);
    if (element.length > 0) {
      let sequencePath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence';
      let element1 = select(sequencePath, this.doc);
      if (element1.length > 0) {
        let childPath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence/xs:element';
        let childs = select(childPath, this.doc);
        if (childs.length > 0) {
          for (let i = 0; i < childs.length; i++) {
            nodes = {};
            for (let j = 0; j < childs[i].attributes.length; j++) {
              let a = childs[i].attributes[j].nodeName;
              let b = childs[i].attributes[j].nodeValue;
              nodes = Object.assign(nodes, this._defineProperty({}, a, b));
            }
            nodes.parent = parent;
            childArr.push(nodes);
            if (data) {
              data.children = childArr;
            } else {
              this.childNode = childArr;
            }
          }
        }
        let seqChoicePath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence/xs:choice/xs:element';
        let getChildChoice = select(seqChoicePath, this.doc);
        if (getChildChoice.length > 0) {
          for (let i = 0; i < getChildChoice.length; i++) {
            nodes = {};
            for (let j = 0; j < getChildChoice[i].attributes.length; j++) {
              let a = getChildChoice[i].attributes[j].nodeName;
              let b = getChildChoice[i].attributes[j].nodeValue;
              nodes = Object.assign(nodes, this._defineProperty({}, a, b));
            }
            nodes.parent = parent;
            nodes.choice = parent;
            childArr.push(nodes);
            if (data) {
              data.children = childArr;
            } else {
              this.childNode = childArr;
            }
          }
        }
        let seqChoiceSeqPath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence/xs:choice/xs:sequence/xs:element';
        let getChildChoiceSeq = select(seqChoiceSeqPath, this.doc);
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
            if (data) {
              data.children = childArr;
            } else {
              this.childNode = childArr;
            }
          }
        }
        return childArr;
      }
      let choicePath = '//xs:complexType[@name=\'' + node + '\']/xs:choice';
      if ((select(choicePath, this.doc)).length) {
        let childPath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:choice/xs:element';
        let childs = select(childPath, this.doc);
        if (childs.length > 0) {
          for (let i = 0; i < childs.length; i++) {
            nodes = {};
            for (let j = 0; j < childs[i].attributes.length; j++) {
              let a = childs[i].attributes[j].nodeName;
              let b = childs[i].attributes[j].nodeValue;
              nodes = Object.assign(nodes, this._defineProperty({}, a, b));
            }
            nodes.parent = parent;
            nodes.choice = parent;
            childArr.push(nodes);
            if (data) {
              data.children = childArr;
            } else {
              this.childNode = childArr;
            }
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
            this.addTypeChildNode(typeElement[0].attributes[i].nodeValue, parentNode, undefined);
          }
        }
      }
    }
  }

  addChild(child, nodeArr, check, index) {
    let attrs = this.checkAttributes(child.ref);
    let text = this.checkText(child.ref);
    let value = this.getValues(child.ref);
    let attrsType: any = this.getAttrFromType(child.ref, child.parent);
    let valueType = this.getValueFromType(child.ref, child.parent);
    let val = this.getVal(child);
    if ((_.isEmpty(val)) && (_.isEmpty(value)) && (_.isEmpty(valueType))) {
      val = this.getValFromDefault(child);
    }
    child.recreateJson = true;
    child.order = index;
    child.children = [];
    nodeArr.expanded = true;
    child.uuid = this.counting;
    child.key = this.counting;
    child.parentId = nodeArr.uuid;
    this.counting++;
    child.expanded = child.children && child.children.length > 0;
    if (!(_.isEmpty(attrs))) {
      this.attachAttrs(attrs, child);
    }

    nodeArr.children.push(child);
    nodeArr.children = _.sortBy(nodeArr.children, 'order');
    if (check) {
      if ((nodeArr && (nodeArr.ref !== 'SystemMonitorNotification' || (nodeArr.ref === 'SystemMonitorNotification' && child.ref !== 'Timer')))) {
        this.autoAddChild(child);
      }
    }
    if (!(_.isEmpty(val))) {
      this.attachValue(val, nodeArr.children);
    }
    if (!(_.isEmpty(value))) {
      this.attachValue(value, nodeArr.children);
    }
    if (valueType !== undefined) {
      this.attachValue(valueType, nodeArr.children);
    }
    if (attrsType !== undefined) {
      this.attachTypeAttrs(attrsType, nodeArr.children);
    }
    if (!_.isEmpty(text)) {
      this.addText(text, nodeArr.children);
    }
    // this.autoExpand(nodeArr);
    this.printArraya(false);
    if (child) {
      this.selectedNode = child;
      this.getData(this.selectedNode);

      if (this.nodes.length > 0) {
        this.scrollTreeToGivenId(this.selectedNode.uuid);
      }
    }
  }

  autoAddChild(child) {
    if (this.autoAddCount === 0) {
      let getCh = this.checkChildNode(child, undefined);
      if (getCh) {
        for (let i = 0; i < getCh.length; i++) {
          if (getCh[i].minOccurs === undefined || getCh[i].minOccurs === 1) {
            if (!getCh[i].choice) {
              getCh[i].children = [];
              this.autoAddCount++;
              this.addChild(getCh[i], child, true, i);
            }
          }
        }
      }
      this.getData(child);
      this.printArraya(false);
    }
  }

  addText(text, child) {
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

  attachTypeAttrs(attrs, child) {
    for (let i = 0; i < child.length; i++) {
      if (attrs[0] && attrs[0].parent === child[i].ref && attrs[0].grandFather === child[i].parent) {
        if (!child[i].attributes) {
          child[i].attributes = [];
          for (let j = 0; j < attrs.length; j++) {
            this.checkAttrsText(attrs[i]);
            this.checkAttrsValue(attrs[j]);
            attrs[j].id = this.counting;
            if (attrs[j].default) {
              attrs[j].data = attrs[j].default;
            }
            this.counting++;
            child[i].attributes.push(attrs[j]);
          }
          this.printArraya(false);
        } else {
          for (let j = 0; j < attrs.length; j++) {
            this.checkAttrsText(attrs[i]);
            this.checkAttrsValue(attrs[j]);
            attrs[j].id = this.counting;
            if (attrs[j].default) {
              attrs[j].data = attrs[j].default;
            }
            this.counting++;
            child[i].attributes.push(attrs[j]);
          }
          this.printArraya(false);
        }
      }
    }
  }

  attachAttrs(attrs, child) {
    if (!child.attribute) {
      child.attributes = [];
      for (let j = 0; j < attrs.length; j++) {
        this.checkAttrsText(attrs[j]);
        attrs[j].id = this.counting;
        this.counting++;
        if (!attrs[j].data) {
          this.checkAttrsValue(attrs[j]);
          if (attrs[j].default) {
            attrs[j].data = attrs[j].default;
          }
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
              value[j].key = this.counting;
              this.counting++;
              child[i].values.push(value[j]);
            }
            this.printArraya(false);
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
                value[j].key = this.counting;
                this.counting++;
                child[i].values.push(value[j]);
              }
              this.printArraya(false);
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
          valueJson = Object.assign(valueJson, this._defineProperty({}, a, b));
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
          valueJson = Object.assign(valueJson, this._defineProperty({}, a, b));
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
    if (element[0] && element[0].nodeValue !== 'NotEmptyType') {
      let a = element[0].nodeName;
      let x = element[0].nodeValue;
      value = Object.assign(value, this._defineProperty({}, a, x));
      let defultPath = '//xs:element[@name=\'' + node + '\']/@*';
      let defAttr = select(defultPath, this.doc);
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
      var _a13 = element[0].nodeName;
      var _x2 = element[0].nodeValue;
      value = Object.assign(value, this._defineProperty({}, _a13, _x2));
      var simpleTypePath = '//xs:simpleType[@name=\'' + value.base + '\']/xs:restriction/@*';
      element = select(simpleTypePath, this.doc);

      if (element.length > 0) {
        _a13 = element[0].nodeName;
        b = element[0].nodeValue;
        value = Object.assign(value, this._defineProperty({}, _a13, b));
        var minLengthPath = '//xs:simpleType[@name=\'' + _x2 + '\']/xs:restriction/xs:minLength/@*';
        element = select(minLengthPath, this.doc);
        _a13 = element[0].nodeName;
        b = element[0].nodeValue;
        value = Object.assign(value, this._defineProperty({}, _a13, b));
      }

      var _defultPath = '//xs:element[@name=\'' + node + '\']/@*';

      var _defAttr = select(_defultPath, this.doc);

      if (_defAttr.length > 0) {
        for (let _s = 0; _s < _defAttr.length; _s++) {
          if (_defAttr[_s].nodeName === 'default') {
            value.default = _defAttr[_s].nodeValue;
            value.data = _defAttr[_s].nodeValue;
          }
        }
      }

      value.parent = node;
    } else {
      var extensionPath1 = '//xs:element[@name=\'' + node + '\']/xs:simpleType/xs:restriction/@*';
      element = select(extensionPath1, this.doc);

      if (element.length > 0) {
        var _a14 = element[0].nodeName;
        var c = element[0].nodeValue;
        value = Object.assign(value, this._defineProperty({}, _a14, c));

        var _defultPath2 = '//xs:element[@name=\'' + node + '\']/@*';

        var _defAttr2 = select(_defultPath2, this.doc);

        if (_defAttr2.length > 0) {
          for (let _s2 = 0; _s2 < _defAttr2.length; _s2++) {
            if (_defAttr2[_s2].nodeName === 'default') {
              value.default = _defAttr2[_s2].nodeValue;
              value.data = _defAttr2[_s2].nodeValue;
            }
          }
        }

        var _minLengthPath = '//xs:element[@name=\'' + node + '\']/xs:simpleType/xs:restriction/xs:minLength/@*';

        element = select(_minLengthPath, this.doc);
        var enumPath = '//xs:element[@name=\'' + node + '\']/xs:simpleType/xs:restriction/xs:enumeration/@*';
        var ele = select(enumPath, this.doc);

        if (element.length > 0) {
          _a14 = element[0].nodeName;
          b = element[0].nodeValue;
          value = Object.assign(value, this._defineProperty({}, _a14, b));
          var defultPath1 = '//xs:element[@name=\'' + node + '\']/@*';

          var _defAttr3 = select(defultPath1, this.doc);

          if (_defAttr3.length > 0) {
            for (let _s3 = 0; _s3 < _defAttr3.length; _s3++) {
              if (_defAttr3[_s3].nodeName === 'default') {
                value.default = _defAttr3[_s3].nodeValue;
                value.data = _defAttr3[_s3].nodeValue;
              }
            }
          }
        }

        if (ele.length > 0) {
          value.values = [];

          for (let i = 0; i < ele.length; i++) {
            let z = {};
            let _x3 = ele[i].nodeName;
            let y = ele[i].nodeValue;
            z = Object.assign(z, this._defineProperty({}, _x3, y));
            value.values.push(z);
          }

          var defultPath2 = '//xs:element[@name=\'' + node + '\']/@*';

          var _defAttr4 = select(defultPath2, this.doc);

          if (_defAttr4.length > 0) {
            for (let _s4 = 0; _s4 < _defAttr4.length; _s4++) {
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
    var attr = select(xmlEditorPath, this.doc);

    if (attr.length > 0) {
      value.base = attr[0].nodeValue;
    }

    if (_.isEmpty(value)) {
      var _x4;

      var valueFromXmlEditorPath = '//xs:element[@name=\'' + node + '\']/xs:annotation/xs:appinfo/XmlEditor';
      var attr1 = select(valueFromXmlEditorPath, this.doc);

      if (attr1.length > 0) {
        if (attr1[0].attributes && attr1[0].attributes.length > 0) {
          for (let _i32 = 0; _i32 < attr1[0].attributes.length; _i32++) {
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

  addDefaultValue(node) {
    if (node.values && (node.values[0].base === 'xs:string' && (node.values[0] && node.values[0].values && node.values[0].values.length > 0) && node.values[0].default === undefined)) {
      node.values[0].default = node.values[0].values[0].value;
      node.values[0].data = node.values[0].values[0].value;
    } else if (node.values && (node.values[0].base === 'xs:boolean') && node.values[0].default === undefined) {
      node.values[0].default = true;
      node.values[0].data = true;
    }
  }

  getCustomCss(node, parentNode) {
    let count = 0;
    if (this.choice) {
      if (node.maxOccurs === 'unbounded') {
        return '';
      } else if (node.maxOccurs !== 'unbounded' && node.maxOccurs !== undefined) {
        if (parentNode.children && parentNode.children.length > 0) {
          for (let i = 0; i < parentNode.children.length; i++) {
            if (node.ref === parentNode.children[i].ref) {
              count++;
            }
          }
          if (node.maxOccurs === count) {
            return 'disabled disable-link';
          }
        }
      } else if (node.maxOccurs === undefined) {
        if (parentNode.children && parentNode.children.length > 0) {
          for (let i = 0; i < parentNode.children.length; i++) {
            if (node.ref === parentNode.children[i].ref) {
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
      if (parentNode.children && parentNode.children.length > 0) {
        for (let i = 0; i < parentNode.children.length; i++) {
          if (node.ref === parentNode.children[i].ref) {
            count++;
          }
        }
        if (node.maxOccurs === count) {
          return 'disabled disable-link';
        }
      }
    } else if (node.maxOccurs === undefined) {
      if (parentNode.children && parentNode.children.length > 0) {
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
          if (node.maxOccurs === count) {
            return 'disabled disable-link';
          }
        }
      } else if (node.maxOccurs === undefined) {
        if (parentNode.children && parentNode.children.length > 0) {
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
    let keys = [];
    let count = 0;
    // tslint:disable-next-line: forin
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
        if (count1 === keys.length) {
          return true;
        }
      }
    }
    return false;
  }

  printArray(rootchildrensattrArr) {
    this.nodes.push(rootchildrensattrArr);
    this.printArraya(true);
  }

  printArraya(flag) {
    if (!flag) {
      this.autoAddCount = 0;
    }
    this.xpath();
    this.AddKeyReferencing();
    this.autoValidate();
    this.nodes = [...this.nodes];
  }

  // autoValidate
  autoValidate() {
    if (this.nodes[0] && this.nodes[0].attributes && this.nodes[0].attributes.length > 0) {
      for (let i = 0; i < this.nodes[0].attributes.length; i++) {
        if (this.nodes[0].attributes[i].use === 'required') {
          if (this.nodes[0].attributes[i].data === undefined) {
            this.nonValidattribute = this.nodes[0].attributes[i];
            this.errorLocation = this.nodes[0];
            this.validConfig = false;
            return false;
          }
        }
      }
    }
    if (this.nodes[0] && this.nodes[0].values && this.nodes[0].values.length > 0) {
      if (this.nodes[0].values[0].data === undefined) {
        this.nonValidattribute = this.nodes[0].values[0];
        this.errorLocation = this.nodes[0];
        this.validConfig = false;
        return false;
      }
    }
    if (this.nodes[0] && this.nodes[0].children && this.nodes[0].children.length > 0) {
      for (let i = 0; i < this.nodes[0].children.length; i++) {
        let x = this.autoValidateRecursion(this.nodes[0].children[i]);
        if (x === false) {
          return x;
        }
      }
    }
    this.nonValidattribute = {};
  }

  autoValidateRecursion(child) {
    if (child && child.attributes && child.attributes.length > 0) {
      for (let i = 0; i < child.attributes.length; i++) {
        if (child.attributes[i].use === 'required') {
          if (child.attributes[i].data === undefined) {
            this.nonValidattribute = child.attributes[i];
            this.errorLocation = child;
            this.validConfig = false;
            return false;
          }
        }
      }
    }
    if (child && child.values && child.values.length > 0) {
      if (child.values[0].data === undefined) {
        this.nonValidattribute = child.values[0];
        this.errorLocation = child;
        this.validConfig = false;
        return false;
      }
    }
    if (child && child.children && child.children.length > 0) {
      for (let i = 0; i < child.children.length; i++) {
        let x = this.autoValidateRecursion(child.children[i]);
        if (x === false) {
          return x;
        }
      }
    }
  }

  // drag and drop check
  dragAndDropRules(arg: NzFormatBeforeDropEvent): Observable<boolean> {
    let dropNode = arg.node.origin;
    let dragNode = arg.dragNode.origin;
    if (dropNode.ref === dragNode.parent) {
      let count = 0;
      if (dragNode.maxOccurs === 'unbounded') {
        this.dropCheck = {status: true, dropNode: dropNode.ref};
        return of(true);
      } else if (dragNode.maxOccurs !== 'unbounded' && dragNode.maxOccurs !== undefined) {
        if (dropNode.children.length > 0) {
          for (let i = 0; i < dropNode.children.length; i++) {
            if (dragNode.ref === dropNode.children[i].ref) {
              count++;
            }
          }
          if (dragNode.maxOccurs !== count) {
            this.dropCheck = {status: dragNode.maxOccurs !== count, dropNode: dropNode.ref};
            return of(true);
          } else {
            this.dropCheck = {status: dragNode.maxOccurs !== count, dropNode: undefined};
            return of(false);
          }
        } else if (dropNode.children.length === 0) {
          this.dropCheck = {status: true, dropNode: dropNode.ref};
          return of(true);
        }
      } else if (dragNode.maxOccurs === undefined) {
        if (dropNode.children.length > 0) {
          if (dropNode.children.length > 0) {
            if (dragNode.ref !== dropNode.children[0].ref) {
              this.dropCheck = {status: dragNode.ref !== dropNode.children[0].ref, dropNode: dropNode.ref};
              return of(true);
            } else {
              this.dropCheck = {status: dragNode.ref !== dropNode.children[0].ref, dropNode: undefined};
              return of(false);
            }
          }
        } else if (dropNode.children.length === 0) {
          this.dropCheck = {status: true, dropNode: dropNode.ref};
          return of(true);
        }
      } else {
        this.dropCheck = {status: false, dropNode: undefined};
        return of(false);
      }
    } else {
      this.dropCheck = {status: false, dropNode: undefined};
      return of(false);
    }
  }

  dragOverRules(arg: NzFormatBeforeDropEvent) {
    let dropNode = arg.node.origin;
    let dragNode = arg.dragNode.origin;
    if (dropNode.ref === dragNode.parent) {
      let count = 0;
      if (dragNode.maxOccurs === 'unbounded') {
        this.dropCheck = {status: true, dropNode: dropNode, dragNode: dragNode};
      } else if (dragNode.maxOccurs !== 'unbounded' && dragNode.maxOccurs !== undefined) {
        if (dropNode.children.length > 0) {
          for (let i = 0; i < dropNode.children.length; i++) {
            if (dragNode.ref === dropNode.children[i].ref) {
              count++;
            }
          }
          if (dragNode.maxOccurs !== count) {
            this.dropCheck = {status: dragNode.maxOccurs !== count, dropNode: dropNode, dragNode: dragNode};
          } else {
            this.dropCheck = {status: dragNode.maxOccurs !== count, dropNode: undefined, dragNode: undefined};
          }
        } else if (dropNode.children.length === 0) {
          this.dropCheck = {status: true, dropNode: dropNode, dragNode: dragNode};
        }
      } else if (dragNode.maxOccurs === undefined) {
        if (dropNode.children.length > 0) {
          if (dropNode.children.length > 0) {
            if (dragNode.ref !== dropNode.children[0].ref) {
              this.dropCheck = {status: dragNode.ref !== dropNode.children[0].ref, dropNode: dropNode, dragNode: dragNode};
            } else {
              this.dropCheck = {status: dragNode.ref !== dropNode.children[0].ref, dropNode: undefined, dragNode: undefined};
            }
          }
        } else if (dropNode.children.length === 0) {
          this.dropCheck = {status: true, dropNode: dropNode, dragNode: dragNode};
        }
      } else {
        this.dropCheck = {status: false, dropNode: undefined, dragNode: undefined};
      }
    } else {
      this.dropCheck = {status: false, dropNode: undefined, dragNode: undefined};
    }
  }

  // drop data
  dropData(arg: NzFormatBeforeDropEvent) {
    let from = arg.dragNode.origin;
    let to = arg.node.origin;
    if (this.dropCheck.status && this.dropCheck && this.dropCheck.dropNode && this.dropCheck.dropNode.ref === to.ref) {
      this.removeNode(this.dropCheck.dragNode);
      from.parentId = to.uuid;
    }
  }


  // to send data in details component
  getData(event) {
    setTimeout(() => {
      this.calcHeight();
    }, 1);
    if (event && event.keyref) {
      for (let i = 0; i < event.attributes.length; i++) {
        if (event.attributes[i].name === event.keyref) {
          this.getDataAttr(event.attributes[i].refer);
          break;
        }
      }
    }
    this.selectedNode = event;
    this.breadCrumbArray = [];
    this.createBreadCrumb(event);
    this.breadCrumbArray.reverse();
  }

  // BreadCrumb
  createBreadCrumb(node) {
    if (this.nodes[0] && this.nodes[0].ref === node.parent && this.nodes[0].uuid === node.parentId) {
      this.breadCrumbArray.push(this.nodes[0]);
    } else {
      if (this.nodes[0] && this.nodes[0].children && this.nodes[0].children.length > 0) {
        for (let i = 0; i < this.nodes[0].children.length; i++) {
          this.createBreadCrumbRecursion(node, this.nodes[0].children[i]);
        }
      }
    }
  }

  createBreadCrumbRecursion(node, nodes) {
    if (nodes.ref === node.parent && nodes.uuid === node.parentId) {
      this.breadCrumbArray.push(nodes);
      this.createBreadCrumb(nodes);
    } else {
      if (nodes.children && nodes.children.length > 0) {
        for (let i = 0; i < nodes.children.length; i++) {
          this.createBreadCrumbRecursion(node, nodes.children[i]);
        }
      }
    }
  }

  // Expand automatically on add nodes
  autoExpand(exNode) {
    exNode.expanded = true;
    this.updateTree();
  }

  // expand particular node
  expandNode(node) {
    node.expanded = true;
    if (node.children && node.children.length > 0) {
      for (let i = 0; i < node.children.length; i++) {
        node.children[i].expanded = true;
        if (node.children[i].children && node.children[i].children.length > 0) {
          this.expandCollapseRec(node.children[i].children, true);
        } else {
          this.updateTree();
        }
      }
    }
  }

  checkChoice(node) {
    this.getNodeRulesData(node);
    if (this.childNode && this.childNode.length > 0) {
      let flg = true;
      for (let i = 0; i < this.childNode.length; i++) {
        if (this.childNode[i] && this.childNode[i].choice) {
          if (node && node.children && node.children.length > 0) {
            for (let j = 0; j < node.children.length; j++) {
              if (node.children[j].choice && node.children[j].ref === this.childNode[i].ref) {
                this.choice = true;
                flg = false;
                break;
              }
            }
            if (flg) {
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
    node.expanded = false;
    if (node.children && node.children.length > 0) {
      for (let i = 0; i < node.children.length; i++) {
        node.children[i].expanded = false;
        if (node.children[i].children && node.children[i].children.length > 0) {
          this.expandCollapseRec(node.children[i].children, false);
        } else {
          this.updateTree();
        }
      }
    }
  }

// Remove Node
  removeNode(node) {
    if (node.parent === '#') {
      alert('Cannot Delete Root Node');
    } else {
      this.isNext = false;
      this.getParent(node, this.nodes[0]);
    }
  }

  getParent(node, list) {
    if (node.parentId === list.uuid && list.parent === '#') {
      this.deleteData(list.children, node, list);
    } else {
      if (list.children) {
        for (let i = 0; i < list.children.length; i++) {
          if (node.parentId === list.children[i].uuid) {
            this.deleteData(list.children[i].children, node, list.children[i]);
          } else {
            this.getParent(node, list.children[i]);
          }
        }
      }
    }
  }

  deleteData(parentNode, node, parent) {
    if (parentNode) {
      for (let i = 0; i < parentNode.length; i++) {
        if (node.ref === parentNode[i].ref && node.uuid === parentNode[i].uuid) {
          parentNode.splice(i, 1);
          this.updateTree();
          this.printArraya(false);
          this.getData(parent);
          this.isNext = false;
        }
      }
      if (node.key) {
        if (this.nodes[0].keyref) {
          if (this.nodes[0].attributes.length > 0) {
            for (let i = 0; i < this.nodes[0].attributes.length; i++) {
              if (this.nodes[0].keyref === this.nodes[0].attributes[i].name) {
                for (let j = 0; j < node.attributes.length; j++) {
                  if (node.attributes[j].name === node.key) {
                    if (this.nodes[0].attributes[i].data === node.attributes[j].data) {
                      for (let key in this.nodes[0].attributes[i]) {
                        if (key === 'data') {
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
            for (let j = 0; j < node.attributes.length; j++) {
              if (node.attributes[j].name === node.key) {
                if (child.attributes[i].data === node.attributes[j].data) {
                  for (let key in child.attributes[i]) {
                    if (key === 'data') {
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
      if (child.children) {
        for (let i = 0; i < child.children.length; i++) {
          this.deleteKeyRefData(child.children[i], node);
        }
      }
    }
  }

  // Cut Node
  cutNode(node) {
    this.validConfig = false;
    this.copyItem = {};
    this.copyItem = Object.assign(this.copyItem, node);
    this.cutData = true;
    // this.searchAndRemoveNode(node);
    if (this.XSDState && this.XSDState.message && this.XSDState.message.code === 'XMLEDITOR-101') {
      this.XSDState.message.code = 'XMLEDITOR-104';
    }
  }

  // searchNode
  searchAndRemoveNode(node) {
    if (node.parent === this.nodes[0].ref && node.parentId === this.nodes[0].uuid) {
      for (let i = 0; i < this.nodes[0].children.length; i++) {
        if (node.uuid === this.nodes[0].children[i].uuid) {
          this.nodes[0].children.splice(i, 1);
        }
      }
    } else {
      for (let i = 0; i < this.nodes[0].children.length; i++) {
        this.searchAndRemoveNodeRecursion(node, this.nodes[0].children[i]);
      }
    }
  }

  // searchNodeRecursion
  searchAndRemoveNodeRecursion(node, child) {
    if (node.parent === child.ref && node.parentId === child.uuid) {
      for (let i = 0; i < child.children.length; i++) {
        if (node.uuid === child.children[i].uuid) {
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
    this.copyItem = undefined;
    this.cutData = false;
    for (let key in node) {
      if (typeof (node[key]) === 'object') {
        this.copyItem = Object.assign({}, this.copyItem, this._defineProperty({}, key, []));
        if ((key === 'attributes' || key === 'values') && node[key].length > 0) {
          for (let i = 0; i < node[key].length; i++) {
            let temp = {};
            for (let a in node[key][i]) {
              if (a === 'id') {
                temp = Object.assign(temp, this._defineProperty({}, a, this.counting));
                this.counting++;
              } else {
                temp = Object.assign(temp, this._defineProperty({}, a, node[key][i][a]));
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
          this.copyItem = Object.assign({}, this.copyItem, this._defineProperty({}, key, node[key]));
        }
      } else {
        this.copyItem = Object.assign({}, this.copyItem, this._defineProperty({}, key, node[key]));
      }
    }
  }

  // check rules before paste
  checkRules(pasteNode, copyNode) {
    if (copyNode !== undefined) {
      this.checkRule = false;
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
            this.checkRule = copyNode.maxOccurs !== count;
          } else if (pasteNode.children.length === 0) {
            this.checkRule = true;
          }
        } else if (copyNode.maxOccurs === undefined) {
          if (pasteNode.children.length > 0) {
            for (let i = 0; i < pasteNode.children.length; i++) {
              if (copyNode.ref === pasteNode.children[i].ref) {
                this.checkRule = false;
                break;
              }
            }
          } else if (pasteNode.children.length === 0) {
            this.checkRule = true;
          }
        }
      } else {
        this.checkRule = false;
      }
    } else {
      this.checkRule = false;
    }
  }

  // Paste Node
  pasteNode(node) {
    if (this.cutData) {
      this.searchAndRemoveNode(this.copyItem);
    }
    this.copyItem.uuid = node.uuid + this.counting;
    this.copyItem.key = node.uuid + this.counting;
    this.counting++;
    if (this.copyItem && !this.copyItem.order) {
      let a = this.checkChildNode(node, undefined);
      if (a && a.length > 0) {
        for (let i = 0; i < a.length; i++) {
          if (a[i].ref === this.copyItem.ref) {
            this.copyItem.order = i;
            break;
          }
        }
      }
    }
    if (this.copyItem.children) {
      this.copyItem.children.forEach((res: any) => {
        this.changeUuId(res, this.copyItem.uuid);
        this.changeParentId(res, this.copyItem.uuid);
      });
    }
    let copyData = JSON.parse(JSON.stringify(this.copyItem));
    if (node.ref === 'Profiles' && this.router.url.split('/')[2] === 'yade' && !this.cutData) {
      let tName;
      let x = [];
      if (copyData && copyData.attributes) {
        for (let i = 0; i < copyData.attributes.length; i++) {
          if (copyData.attributes[i].name === 'profile_id' && copyData.attributes[i].data) {
            for (let j = 0; j < node.children.length; j++) {
              for (let k = 0; k < node.children[j].attributes.length; k++) {
                if (node.children[j].attributes[k].name === 'profile_id' && node.children[j].attributes[k].data) {
                  if (node.children[j].attributes[k].data.match(/-copy[0-9]+/i)) {
                    x.push(node.children[j].attributes[k].data);
                    tName = node.children[j].attributes[k].data;
                    break;
                  }
                }
              }
            }
          }
          if (!tName && copyData.attributes[i].data) {
            tName = _.clone(copyData.attributes[i].data + '-copy1');
          } else if (tName) {
            if (tName !== copyData.attributes[i].data && tName.split('-copy')) {
              let xz = tName.split('-copy');
              tName = xz[xz.length - 1];
              tName = parseInt(tName, 10) || 0;
            } else {
              tName = 0;
            }
            tName = _.clone((copyData.attributes[i].data || 'profile') + '-copy' + (tName + 1));

          }
          if (tName) {
            copyData.attributes[i].data = _.clone(tName);
          }
          break;
        }
      }
    }
    node.children.push(Object.assign({}, copyData));
    node.children = _.sortBy(node.children, 'order');
    this.cutData = false;
    this.checkRule = true;
    this.printArraya(false);
    this.selectedNode = copyData;
    this.getIndividualData(this.selectedNode, undefined);
    this.scrollTreeToGivenId(this.selectedNode.uuid);
  }

  renameTab(tab) {
    if (this.schemaIdentifier) {
      tab.rename = true;
      this.oldName = _.clone(tab.name);
      setTimeout(() => {
        let wt = $('#' + tab.id).width();
        try {
          const dom = $('#rename-field');
          dom.width(wt - 14);
          dom.focus();
          dom.select();
        } catch (e) {

        }
      }, 0);
    }
  }

  renameOnEnter($event, data) {
    if ($event.which === 13 || $event.key === 'Enter') {
      delete data['rename'];
      if (data.name && data.name !== this.oldName) {
        this.renameFile(data);
      } else {
        data.name = _.clone(this.oldName);
        this.oldName = null;
      }
    }
  }

  renameFile(data) {
    this.coreService.post('xmleditor/rename', {
      controllerId: this.schedulerIds.selected,
      objectType: this.objectType,
      id: data.id,
      name: data.name,
      schemaIdentifier: this.schemaIdentifier
    }).subscribe((res) => {
      this.oldName = null;
    }, (err) => {
      data.name = this.oldName;
      this.toasterService.pop('error', err.data.error.message);
    });
  }

  renameDone(data) {
    if (data.name && data.name !== this.oldName) {
      this.renameFile(data);
    } else {
      data.name = _.clone(this.oldName);
      this.oldName = null;
    }
    delete data['rename'];
  }

  cancelRename(data) {
    delete data['rename'];
    data.name = _.clone(this.oldName);
    this.oldName = null;
  }

// Show all Child Nodes and search functionalities.
  showAllChildNode(node) {
    this.showAllChild = [];
    const text = node.text;
    const _node = {ref: node.ref, parent: node.parent};
    const obj = {ref: node.ref, parent: node.parent, children: [], expanded: true};
    this.checkChildNode(obj, obj);
    this.counter = 0;
    this.getAllChild(obj.children);
    this.showAllChild.push(obj);
    const modalRef = this.modalService.open(ShowChildModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.showAllChild = this.showAllChild;
    modalRef.componentInstance.doc = this.doc;
    modalRef.result.then(() => {

    }, () => {

    });
  }

  // key and Key Ref Implementation code
  xpath() {
    const select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let a;
    if (this.nodes[0]) {
      a = this.nodes[0].ref;
    }
    const keyPath = '/xs:schema/xs:element[@name=\'' + a + '\']/xs:key/@name';
    const keyRefPath = '/xs:schema/xs:element[@name=\'' + a + '\']/xs:keyref';
    let keyattrs: any = {};

    if (!this.keyRefNodes || this.keyRefNodes.length === 0) {
      try {
        this.keyRefNodes = select(keyRefPath, this.doc);
      } catch (err) {
        console.error(err);
      }
    }
    if (!this.keyNodes || this.keyNodes.length === 0) {
      this.keyNodes = select(keyPath, this.doc);
    }
    if (this.keyNodes.length > 0) {
      for (let i = 0; i < this.keyNodes.length; i++) {
        let key = this.keyNodes[i].nodeName;
        let value = this.strReplace(this.keyNodes[i].nodeValue);
        keyattrs = Object.assign(keyattrs, this._defineProperty({}, key, value));
        for (let j = 0; j < this.keyNodes[i].ownerElement.childNodes.length; j++) {
          if (this.keyNodes[i].ownerElement.childNodes[j].nodeName === 'xs:field') {
            for (let k = 0; k < this.keyNodes[i].ownerElement.childNodes[j].attributes.length; k++) {
              keyattrs.key = this.strReplace(this.keyNodes[i].ownerElement.childNodes[j].attributes[k].nodeValue);
            }
            break;
          }
        }
        this.attachKey(keyattrs);
      }
    }
    if (this.keyRefNodes.length > 0) {
      for (let i = 0; i < this.keyRefNodes.length; i++) {
        this.getKeyRef(this.keyRefNodes[i]);
      }
    }
  }

  getKeyRef(keyRefNodes) {
    let attrs: any = {};
    for (let i = 0; i < keyRefNodes.attributes.length; i++) {
      let key = keyRefNodes.attributes[i].nodeName;
      let value = this.strReplace(keyRefNodes.attributes[i].nodeValue);
      attrs = Object.assign(attrs, this._defineProperty({}, key, value));
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
    if (this.nodes[0] && this.nodes[0].children) {
      for (let i = 0; i < this.nodes[0].children.length; i++) {
        if (this.nodes[0].children[i].ref === nodes.name) {
          if (k) {
            this.nodes[0].children[i].key = nodes.key;
          } else if (keyre) {
            this.nodes[0].children[i].keyref = nodes.keyref;
          }
        } else {
          if (this.nodes[0].children[i].children) {
            recursion(nodes, this.nodes[0].children[i].children);
          }
        }
      }
    }


    function recursion(showAllChild, child) {
      let ke = false;
      let keyref = false;
      for (let key in showAllChild) {
        if (key === 'key') {
          ke = true;
          break;
        } else if (key === 'keyref') {
          keyref = true;
          break;
        }
      }
      for (let i = 0; i < child.length; i++) {
        if (child[i].ref === showAllChild.name) {
          if (ke) {
            child[i].key = showAllChild.key;
          } else if (keyref) {
            child[i].keyref = showAllChild.keyref;
            if (child[i].attributes) {
              for (let j = 0; j < child[i].attributes.length; j++) {
                if (child[i].attributes[j].name === showAllChild.keyref) {
                  child[i].attributes[j].refer = showAllChild.refer;
                }
              }
            }
          }
        } else {
          if (child[i].children) {
            recursion(showAllChild, child[i].children);
          }

        }
      }
    }
  }

  strReplace(data) {
    return data.replace(/(Key|@)/g, '');
  }

  AddKeyReferencing() {
    let key = {};
    if (this.nodes[0] && this.nodes[0].keyref) {
      for (let i = 0; i < this.nodes[0].attributes.length; i++) {
        if (this.nodes[0].attributes[i].refer) {
          key = Object.assign(key, {refe: this.nodes[0].ref, name: this.nodes[0].attributes[i].refer});
          this.attachKeyReferencing(key);
          break;
        }
      }
    } else {
      if (this.nodes[0] && this.nodes[0].children) {
        for (let i = 0; i < this.nodes[0].children.length; i++) {
          this.AddKeyReferencingRecursion(this.nodes[0].children[i]);
        }
      }
    }
  }

  AddKeyReferencingRecursion(child) {
    let key = {};
    if (child.keyref && child.attributes) {
      for (let i = 0; i < child.attributes.length; i++) {
        if (child.attributes[i].refer) {
          key = Object.assign(key, {refe: child.ref, name: child.attributes[i].refer});
          this.attachKeyReferencing(key);
          if (child.children) {
            for (let k = 0; k < child.children.length; k++) {
              this.AddKeyReferencingRecursion(child.children[k]);
            }
          }
          break;
        }
      }
    } else {
      if (child && child.children) {
        for (let i = 0; i < child.children.length; i++) {
          this.AddKeyReferencingRecursion(child.children[i]);
        }
      }
    }
  }

  attachKeyReferencing(key) {
    if (key.name) {
      if (this.nodes[0].ref === key.name && this.nodes[0].key) {
        for (let i = 0; i < this.nodes[0].attributes.length; i++) {
          if (this.nodes[0].attributes[i].name === this.nodes[0].key) {
            this.nodes[0].attributes[i].refElement = key.refe;
            break;
          }
        }
      } else {
        for (let i = 0; i < this.nodes[0].children.length; i++) {
          this.attachKeyReferencingRecursion(key, this.nodes[0].children[i]);
        }
      }
    }
  }

  attachKeyReferencingRecursion(key, child) {
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
          this.attachKeyReferencingRecursion(key, child.children[i]);
        }
      }
    }
  }

  // details meathod
  onChange(event, nodes) {
    if (!(/[a-zA-Z0-9_]+.*$/.test(event))) {
      this.error = true;
    } else {
      if (event.match(/<[^>]+>/gm)) {
        let x = event.replace(/<[^>]+>/gm);
        if (x !== 'undefined&nbsp;undefined') {
          nodes.values[0] = Object.assign(nodes.values[0], {data: event});
          event = '';
          this.myContent = nodes.values[0].data;
          this.error = false;
        } else {
          delete nodes.values[0].data;
        }
      }
    }
  }

  // validation for attributes
  validateAttr(value, tag) {
    if (tag.type === 'xs:NMTOKEN') {
      if (/\s/.test(value)) {
        this.error = true;
        this.text = tag.name + ': ' + this.spaceNotAllowed;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key === 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else if (value === '' && tag.use === 'required') {
        this.error = true;
        this.text = tag.name + ': ' + this.requiredField;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key === 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else {
        this.error = false;
      }
    } else if (tag.type === 'xs:NCName') {
      if (/[\i:]|[:]/g.test(value)) {
        this.error = true;
        this.text = tag.name + ': ' + this.colonNotAllowed;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key === 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else if (value === '' && tag.use === 'required') {
        this.error = true;
        this.text = tag.name + ': ' + this.requiredField;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key === 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else {
        this.error = false;
      }
    } else if (tag.type === 'xs:string') {
      if (/[a-zA-Z0-9_/s/*]+.*$/.test(value)) {
        this.error = false;
      } else if (tag.use === 'required') {
        this.error = true;
        this.text = tag.name + ': ' + this.requiredField;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key === 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else if (value.length > 0) {
        this.error = true;
        this.text = tag.name + ': ' + this.cannotAddBlankSpace;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key === 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else {
        this.error = false;
      }
    } else if (tag.type === 'xs:positiveInteger') {
      if (/^([0-9])*$/.test(value)) {
        this.error = false;
        this.submitData(value, tag);
      } else if (tag.use === 'required' && value === '') {
        this.error = true;
        this.text = tag.name + ': ' + this.requiredField;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key === 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else if (/[a-zA-Z_*]/.test(value)) {
        this.error = true;
        this.text = tag.name + ': ' + this.onlyPositiveNumbers;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else {
        this.error = true;
        this.text = tag.name + ': ' + this.cannotNegative;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key === 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      }
    } else if (tag.type === 'xs:integer') {
      if (value !== undefined) {
        if (/^(-){0,1}([0-9])*$/.test(value)) {
          this.error = false;
          tag = Object.assign(tag, {data: value});
          this.autoValidate();
        } else if (tag.use === 'required' && value === '') {
          this.error = true;
          this.text = tag.name + ': ' + this.requiredField;
          this.errorName = {e: tag.name};
          if (tag.data !== undefined) {
            for (let key in tag) {
              if (key === 'data') {
                delete tag[key];
                this.autoValidate();
              }
            }
          }
        } else if (/[a-zA-Z_*]/.test(value)) {
          this.error = true;
          this.text = tag.name + ': ' + this.onlyNumbers;
          this.errorName = {e: tag.name};
          if (tag.data !== undefined) {
            for (let key in tag) {
              if (key === 'data') {
                delete tag[key];
                this.autoValidate();
              }
            }
          }
        } else {
          this.error = true;
          this.text = tag.name + ': ' + this.onlyNumbers;
          this.errorName = {e: tag.name};
          if (tag.data !== undefined) {
            for (let key in tag) {
              if (key === 'data') {
                delete tag[key];
                this.autoValidate();
              }
            }
          }
        }
      }
    } else if (tag.type === 'xs:anyURI') {
      if (value) {
        if (value === '' && tag.use === 'required') {
          this.error = true;
          this.text = tag.name + ': ' + this.requiredField;
          this.errorName = {e: tag.name};
          if (tag.data !== undefined) {
            for (let key in tag) {
              if (key === 'data') {
                delete tag[key];
                this.autoValidate();
              }
            }
          }
        } else if (!(this.coreService.xsdAnyURIValidation(value))) {
          this.error = true;
          this.text = tag.name + ': ' + this.notValidUrl;
          this.errorName = {e: tag.name};
          if (tag.data !== undefined) {
            for (let key in tag) {
              if (key === 'data') {
                delete tag[key];
                this.autoValidate();
              }
            }
          }
        } else {
          this.error = false;
          tag = Object.assign(tag, {data: value});
          this.autoValidate();
        }
      }
    } else {
      tag = Object.assign(tag, {data: value});
      this.autoValidate();
    }
  }

  stopPressingSpace(id) {
    $('#' + id).keypress(function (e) {
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
      }
    });
  }

  submitData(value, tag) {
    if (tag.type === 'xs:NMTOKEN') {
      if (/\s/.test(value)) {
        this.error = true;
        this.text = tag.name + ': ' + this.spaceNotAllowed;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key === 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else if (value === '' && tag.use === 'required') {
        this.error = true;
        this.text = tag.name + ':' + this.requiredField;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else {
        this.error = false;
        tag = Object.assign(tag, {data: value});
        this.autoValidate();
      }
    } else if (tag.type === 'xs:NCName') {
      if (/[\i:]|[:]/g.test(value)) {
        this.error = true;
        this.text = tag.name + ': ' + this.colonNotAllowed;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else if (value === '' && tag.use === 'required') {
        this.error = true;
        this.text = tag.name + ': ' + this.requiredField;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key === 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else {
        this.error = false;
        tag = Object.assign(tag, {data: value});
        this.autoValidate();
      }
    } else if (tag.type === 'xs:string') {
      if (/[a-zA-Z0-9_\\s\*]+.*$/.test(value)) {
        this.error = false;
        tag = Object.assign(tag, {data: value});
        this.autoValidate();
      } else if (tag.use === 'required') {
        this.error = true;
        this.text = tag.name + ': ' + this.requiredField;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key === 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else if (value.length > 0) {
        this.error = true;
        this.text = tag.name + ': ' + this.cannotAddBlankSpace;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else {
        this.error = false;
      }
    } else if (tag.type === 'xs:positiveInteger') {
      if (/^([0-9])*$/.test(value)) {
        this.error = false;
        tag = Object.assign(tag, {data: value});
        this.autoValidate();
      } else if (tag.use === 'required' && value === '') {
        this.error = true;
        this.text = tag.name + ': ' + this.requiredField;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else if (/[a-zA-Z_*]/.test(value)) {
        this.error = true;
        this.text = tag.name + ': ' + this.onlyPositiveNumbers;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else if (/[0-9a-zA-Z_*]/.test(value)) {
        this.error = true;
        this.text = tag.name + ': ' + this.onlyPositiveNumbers;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else {
        this.error = true;
        this.text = tag.name + ': ' + this.cannotNegative;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      }
    } else if (tag.type === 'xs:integer') {
      if (/^(-){0,1}([0-9])*$/.test(value)) {
        this.error = false;
        tag = Object.assign(tag, {data: value});
        this.autoValidate();
      } else if (tag.use === 'required' && value === '') {
        this.error = true;
        this.text = tag.name + ': ' + this.requiredField;
        this.errorName = {e: tag.name};
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key === 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else if (/[a-zA-Z_*]/.test(value)) {
        this.error = true;
        this.text = tag.name + ': ' + this.onlyNumbers;
        this.errorName = {e: tag.name};
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key === 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else {
        this.error = true;
        this.text = tag.name + ': ' + this.onlyNumbers;
        this.errorName = {e: tag.name};
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key === 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      }
    } else if (tag.type === 'xs:anyURI') {
      if (value) {
        if (value === '' && tag.use === 'required') {
          this.error = true;
          this.text = tag.name + ': ' + this.requiredField;
          this.errorName = {e: tag.name};
          if (tag.data !== undefined) {
            for (let key in tag) {
              if (key === 'data') {
                delete tag[key];
                this.autoValidate();
              }
            }
          }
        }
        if ((this.coreService.xsdAnyURIValidation(value)) === false) {
          this.error = true;
          this.text = tag.name + ': ' + this.notValidUrl;
          this.errorName = {e: tag.name};
          if (tag.data !== undefined) {
            for (let key in tag) {
              if (key === 'data') {
                delete tag[key];
                this.autoValidate();
              }
            }
          }
        } else {
          this.error = false;
          tag = Object.assign(tag, {data: value});
          this.autoValidate();
        }
      }
    } else {
      if (/[0-9]/.test(value)) {
        this.error = false;
        tag = Object.assign(tag, {data: value});
        this.autoValidate();
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key === 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else if (tag.use === 'required' && value === '') {
        this.error = true;
        this.text = tag.name + ': ' + this.requiredField;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key === 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else if (value == '') {
        tag = Object.assign(tag, {data: tag.defalut});
        this.autoValidate();
      }
    }
  }

// validation for node value property
  validValue(value, ref, tag) {
    if (/^\s*$/.test(value)) {
      this.error = true;
      this.text = this.requiredField;
      this.errorName = {e: ref};
      if (tag.data !== undefined) {
        for (let key in tag) {
          if (key === 'data') {
            delete tag[key];
            this.autoValidate();
          }
        }
      }
    } else {
      this.error = false;
    }
    this.validConfig = false;
  }

  submitValue(value, ref, tag) {
    if (/^\s*$/.test(value)) {
      this.error = true;
      this.text = this.requiredField;
      this.errorName = {e: ref};
      if (tag.data !== undefined) {
        for (let key in tag) {
          if (key === 'data') {
            this.autoValidate();
            delete tag[key];
          }
        }
      }
    } else {
      this.error = false;
      tag.data = value;
      this.autoValidate();
    }
  }

  getDataAttr(refer) {
    this.tempArr = [];
    this.keyrecursion(refer, this.nodes[0].children);
  }

  keyrecursion(refer, childNode) {
    let temp;
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
                this.getData(this.nodes[0]);
                this.selectedNode = this.nodes[0];
                this.refElement = node;
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
    this.scrollTreeToGivenId(this.selectedNode.uuid);
  }

  gotoKeyRecursion(node, child) {
    if (node !== undefined) {
      if (node.refer === child.ref) {
        if (child.key) {
          for (let i = 0; i < child.attributes.length; i++) {
            if (child.attributes[i].name === child.key) {
              if (node.data === child.attributes[i].data) {
                this.getData(child);
                this.selectedNode = child;
                this.refElement = node;
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
                this.getData(this.nodes[0]);
                this.selectedNode = this.nodes[0];
              }
            }
          }
        } else {
          for (let i = 0; i < this.nodes[0].children.length; i++) {
            this.gotoKeyrefRecursion(node, this.nodes[0].children[i]);
          }
        }
      } else if (this.refElement && this.refElement.parent === this.nodes[0].ref) {
        if (this.nodes[0].keyref) {
          for (let i = 0; i < this.nodes[0].attributes.length; i++) {
            if (this.nodes[0].attributes[i].name === this.nodes[0].keyref) {
              if (node.data === this.nodes[0].attributes[i].data) {
                this.getData(this.nodes[0]);
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
    this.scrollTreeToGivenId(this.selectedNode.uuid);
  }

  gotoKeyrefRecursion(node, child) {
    if (node !== undefined) {
      if (node.refElement === child.ref) {
        if (child.keyref) {
          for (let i = 0; i < child.attributes.length; i++) {
            if (child.attributes[i].name === child.keyref) {
              if (node.data === child.attributes[i].data) {
                this.selectedNode = child;
                this.getData(child);
              }
            }
          }
        } else {
          for (let i = 0; i < child.children.length; i++) {
            this.gotoKeyrefRecursion(node, child.children[i]);
          }
        }
      } else if (this.refElement && this.refElement.parent === child.ref) {
        if (child.keyref) {
          for (let i = 0; i < child.attributes.length; i++) {
            if (child.attributes[i].name === child.keyref) {
              if (node.data === child.attributes[i].data) {
                this.selectedNode = child;
                this.getData(child);
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


  addKey(node: any) {
    for (let i = 0; i < node.length; i++) {
      node[i].key = node[i].uuid;
      if (node[i].children && node[i].children.length > 0) {
        this.addKey(node[i].children);
      }
    }
  }

  // import xml model
  importXML() {
    if (this.objectType === 'OTHER') {
      if (localStorage.getItem('schemas')) {
        this.otherSchema = localStorage.getItem('schemas').split(',');
      }
    } else {
      if (localStorage.getItem('yadeSchema')) {
        this.otherSchema = localStorage.getItem('yadeSchema').split(',');
      }
    }
    if (this.objectType !== 'NOTIFICATION') {
      this.importObj = {assignXsd: this.schemaIdentifier};
    } else {
      this.importObj = {assignXsd: this.objectType};
    }
    const modalRef = this.modalService.open(ImportModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.importObj = this.importObj;
    modalRef.componentInstance.otherSchema = this.otherSchema;
    modalRef.componentInstance.importXsd = false;
    modalRef.result.then((res: any) => {
      if (res) {
        this.schemaIdentifier = this.importObj.assignXsd;
        if (this.importObj.assignXsd) {
          if (!this.ok(res.uploadData)) {
            this.uploadData = res.uploadData;
            this.copyItem = undefined;
            this.selectedXsd = this.importObj.assignXsd;
            this.isLoading = true;
            if (this.objectType !== 'NOTIFICATION') {
              if (this.tabsArray.length === 0) {
                let _tab = _.clone({id: -1, name: 'edit1', schemaIdentifier: this.schemaIdentifier});
                this.tabsArray.push(_tab);
                this.activeTab = this.tabsArray[0];
              }
              this.getXsdSchema();
            } else {
              this.xmlToJsonService(res.uploadData);
            }
          } else {
            this.openXMLDialog(res.uploadData);
            this.importObj = {};
          }
        }
      }
    }, () => {

    });
  }

  getXsdSchema() {
    let obj = {
      controllerId: this.schedulerIds.selected,
      objectType: this.objectType,
      uri: this.schemaIdentifier
    };
    this.coreService.post('xmleditor/schema/assign', obj).subscribe((res: any) => {
      if (res.schema) {
        this.path = res.schema;
        this.schemaIdentifier = res.schemaIdentifier;
        this.xmlToJsonService(this.uploadData);
      }
    }, (err) => {
      this.toasterService.pop('error', err.data.error.message);
      this.isLoading = false;
    });
  }

  hideError() {
    this.error = false;
  }

  showDiff() {
    this.xmlVersionObj = {draftVersion: true, liveVersion: false};
    this.draftXml = this.prevXML;
    let liveVersion;
    this.coreService.post('xmleditor/read', {
      controllerId: this.schedulerIds.selected,
      objectType: this.objectType,
      forceLive: true
    }).subscribe((res: any) => {
      if (res.configuration) {
        this.schemaIdentifier = res.schemaIdentifier;
        liveVersion = res.configuration;
        this.liveXml = this.coreService.diff(this.draftXml, res.configuration);
      } else {
        this.submitXsd = false;
        this.isLoading = false;
        this.XSDState = res.state;
        this.XSDState = Object.assign(this.XSDState, {warning: res.warning});
      }
    }, (error) => {
      this.isLoading = false;
      this.toasterService.pop('error', error.error.message);
    });
    const modalRef = this.modalService.open(DiffPatchModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.liveXml = this.liveXml;
    modalRef.componentInstance.draftXml = this.draftXml;
    modalRef.componentInstance.xmlVersionObj = this.xmlVersionObj;
    modalRef.result.then((res: any) => {
      if (res.xmlVersionObj.liveVersion) {
        this.del();
      }
    }, () => {
    });
  }

  getAutoFocus(index, node, type) {
    if (node) {
      if (type === 'attribute' && node) {
        if (this.errorName && this.errorName.e === node.name) {
          return 'true';
        } else if (((this.errorName && this.errorName.e !== node.ref) || !this.errorName) && index == 0) {
          return 'true';
        } else {
          return 'false';
        }
      } else if (type === 'value' && node) {
        if (this.errorName && this.errorName.e === node.ref) {
          return 'true';
        } else if (node && !node.attributes) {
          return 'true';
        }
      }
    }
    return false;
  }

  showPassword(data) {
    data.pShow = !data.pShow;
  }

  checkForTab(id) {
    $(document).delegate('#' + id, 'keydown', function (e) {
      let keyCode = e.keyCode || e.which;
      if (keyCode == 9) {
        e.preventDefault();
        let start = this.selectionStart;
        let end = this.selectionEnd;
        // set textarea value to: text before caret + tab + text after caret
        $(this).val($(this).val().substring(0, start)
          + '\t'
          + $(this).val().substring(end));
        // put caret at right position again
        this.selectionStart =
          this.selectionEnd = start + 1;
      }
    });
  }

  autosize(evt) {
    if (evt) {
      let el = document.getElementById(evt);
      if (el !== null) {
        setTimeout(() => {
          el.style.cssText = 'padding:4px 8px; overflow:hidden;height:' + el.scrollHeight + 'px';
        }, 0);
      }
    }
  }

  // open new Confirmation model
  newFile() {
    if (this.submitXsd && this.objectType === 'NOTIFICATION') {
      const modalRef = this.modalService.open(ConfirmationModalComponent, {backdrop: 'static', size: 'sm'});
      modalRef.componentInstance.save = this.save2;
      modalRef.componentInstance.assignXsd = this.newXsdAssign;
      modalRef.componentInstance.self = this;
      modalRef.result.then((res) => {
        this.copyItem = undefined;
        this.nodes = [];
        this.selectedNode = [];
        this.newConf();
      }, () => {
        this.copyItem = undefined;
        this.nodes = [];
        this.selectedNode = [];
        this.newConf();
      });
    } else if (!this.submitXsd && this.objectType === 'NOTIFICATION') {
      this.copyItem = undefined;
      this.nodes = [];
      this.selectedNode = [];
      this.newConf();
    } else {
      if (this.objectType !== 'NOTIFICATION') {
        this.nodes = [];
        this.selectedNode = [];
        this.selectedXsd = undefined;
        this.copyItem = undefined;
        this.createNewTab();
      } else {
        this.newConf();
      }
    }
  }

  importXSD() {
    this.importXSDFile = true;
    const modalRef = this.modalService.open(ImportModalComponent, {size: 'lg', backdrop: 'static'});
    modalRef.componentInstance.importXsd = true;
    modalRef.result.then((res: any) => {
      this.uploadData = res.uploadData;
      if (!this.ok(this.uploadData)) {
        if (this.reassignSchema) {
          this.changeSchema(res);
        } else {
          this.othersSubmit(res);
        }
        this.importXSDFile = false;
      }
    }, () => {
      this.toasterService.clear();
    });
  }

  othersSubmit(data): void {
    this.isLoading = true;
    let obj: any = {
      controllerId: this.schedulerIds.selected,
      objectType: this.objectType
    };
    if (!this.importXSDFile) {
      obj.uri = this.selectedXsd;
    } else {
      obj.fileName = data._file.name;
      obj.fileContent = this.uploadData;
    }
    this.path = this.selectedXsd;
    this.coreService.post('xmleditor/schema/assign', obj).subscribe((res: any) => {
      this.schemaIdentifier = res.schemaIdentifier;
      this.loadTree(res.schema, false);
      this.submitXsd = true;
      this.isDeploy = false;
      this.prevXML = '';
      this.isLoading = false;
      this.storeXML(res.schemaIdentifier);
    }, (error) => {
      this.isLoading = false;
      if (error.error) {
        this.toasterService.pop('error', error.error.message);
      }
    });
  }

  changeSchema(data) {
    this.isLoading = true;
    let obj;
    if (!this.importXSDFile) {
      obj = {
        controllerId: this.schedulerIds.selected,
        objectType: this.objectType,
        uri: this.selectedXsd,
        configuration: this._showXml()
      };
    } else {
      obj = {
        controllerId: this.schedulerIds.selected,
        objectType: this.objectType,
        fileName: data._file.name,
        fileContent: this.uploadData,
        configuration: this._showXml()
      };
    }
    this.coreService.post('xmleditor/schema/reassign', obj).subscribe((res: any) => {
      this.doc = new DOMParser().parseFromString(res.schema, 'application/xml');
      this.nodes = [];
      this.nodes.push(JSON.parse(res.configurationJson));
      this.getIndividualData(this.nodes[0], undefined);
      this.getData(this.nodes[0]);
      this.submitXsd = true;
      this.isDeploy = false;
      this.activeTab.schemaIdentifier = res.schemaIdentifier;
      this.showSelectSchema = false;
      this.prevXML = '';
      this.schemaIdentifier = res.schemaIdentifier;
      this.storeXML(res.schemaIdentifier);
      this.path = res.schemaIdentifier;
      this.selectedXsd = res.schemaIdentifier;
      this.isLoading = false;
      this.reassignSchema = false;
    }, () => {
      this.isLoading = false;
    });
  }

  private createNewTab() {
    let _tab;
    if (this.tabsArray.length === 0) {
      _tab = _.clone({id: -1, name: 'edit1'});
    } else {
      let tempName;
      _tab = _.clone(this.tabsArray[this.tabsArray.length - 1]);
      _tab.id = Math.sign(_.clone(_tab.id - 1)) === 1 ? -1 : _.clone(_tab.id - 1);
      for (let i = 0; i < this.tabsArray.length; i++) {
        if (this.tabsArray[i].name) {
          let _arr = this.tabsArray[i].name.match(/[a-zA-Z]+/g);
          if (_arr && _arr.length > 0 && _arr[0] === 'edit') {
            if (!tempName) {
              tempName = this.tabsArray[i].name;
            }
            if (tempName && (parseInt(this.tabsArray[i].name.match(/\d+/g)[0], 10) > parseInt(tempName.match(/\d+/g)[0], 10))) {
              tempName = this.tabsArray[i].name;
            }
          }
        }
      }
      if (tempName) {
        _tab.name = _.clone('edit' + (parseInt(tempName.match(/\d+/g)[0], 10) + 1));
      } else {
        _tab.name = 'edit1';
      }
    }
    _tab.schemaIdentifier = null;
    this.tabsArray.push(_tab);
    this.selectedTabIndex = this.tabsArray.length - 1;
    this.reassignSchema = false;
    this.activeTab = _tab;
    // this._activeTab.isVisible = true;
    this.readOthersXSD(_tab.id);
  }

  changeLastUUid(node) {
    this.lastScrollId = _.clone(node.uuid);
  }

  newXsdAssign(self) {
    self.nodes = [];
    self.selectedNode = [];
    self.submitXsd = false;
  }

  // create Xml from Json
  showXml() {
    const xml = this._showXml();
    const modalRef = this.modalService.open(ShowModalComponent, {backdrop: 'static', size: 'lg', windowClass: 'script-editor'});
    modalRef.componentInstance.xml = xml;
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.objectType = this.objectType;
    modalRef.componentInstance.schemaIdentifier = this.schemaIdentifier;
    modalRef.componentInstance.activeTab = this.activeTab;
    modalRef.result.then((res: any) => {
      if (res && res.result.configurationJson) {
        let a = [];
        let arr = JSON.parse(res.result.configurationJson);
        a.push(arr);
        this.counting = arr.lastUuid;
        this.doc = new DOMParser().parseFromString(this.path, 'application/xml');
        this.nodes = a;
        this.submitXsd = true;
        let x = {state: {message: res.result.message}};
        this.XSDState = x.state;
        this.prevXML = '';
        this.selectedNode = this.nodes[0];
        this.getIndividualData(this.selectedNode, undefined);
        this.getData(this.selectedNode);
      }
    }, () => {

    });
  }

  private jsonToXml() {
    if (this.nodes.length > 0) {
      let doc = document.implementation.createDocument('', '', null);
      let peopleElem = doc.createElement(this.nodes[0].ref);
      if (peopleElem) {
        if (this.nodes[0].attributes && this.nodes[0].attributes.length > 0) {
          for (let i = 0; i < this.nodes[0].attributes.length; i++) {
            if (this.nodes[0].attributes[i].data) {
              peopleElem.setAttribute(this.nodes[0].attributes[i].name, this.nodes[0].attributes[i].data);
            }
          }
        }
        if (this.nodes[0] && this.nodes[0].values && this.nodes[0].values.length >= 0) {
          for (let i = 0; i < this.nodes[0].values.length; i++) {
            if (this.nodes[0].values[0].data) {
              peopleElem.createCDATASection(this.nodes[0].values[0].data);
            }
          }
        }
        if (this.nodes[0].children && this.nodes[0].children.length > 0) {
          for (let i = 0; i < this.nodes[0].children.length; i++) {
            this.createChildJson(peopleElem, this.nodes[0].children[i], doc.createElement(this.nodes[0].children[i].ref), doc);
          }
        }
      }
      return peopleElem;
    }
  }

  createChildJson(node, childrenNode, curentNode, doc) {
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
        this.createChildJson(curentNode, childrenNode.children[i], doc.createElement(childrenNode.children[i].ref), doc);
      }
    }
    node.appendChild(curentNode);
  }

  // save xml
  save() {
    const xml = this._showXml();
    const name = this.nodes[0].ref + '.xml';
    const fileType = 'application/xml';
    const blob = new Blob([xml], {type: fileType});
    saveAs(blob, name);
  }

  downloadSchema(objType, schemaIdentifier) {
    let name = objType + '.xsd';
    let link = './api/xmleditor/schema/download?controllerId='
      + this.schedulerIds.selected + '&objectType=' + objType +
      '&accessToken=' + this.authService.accessTokenId;
    if (objType !== 'NOTIFICATION') {
      link = link + '&schemaIdentifier=' + encodeURIComponent(schemaIdentifier);
      name = schemaIdentifier + '.xsd';
    }
    // saveAs(link, name);
    $('#tmpFrame').attr('src', link);
  }

  showXSD(objType, schemaIdentifier) {
    let windowProperties = ',scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no';
    let link = './api/xmleditor/schema/download?show=true&controllerId='
      + this.schedulerIds.selected + '&objectType=' + objType + '&accessToken='
      + this.authService.accessTokenId;
    if (objType !== 'NOTIFICATION') {
      link = link + '&schemaIdentifier=' + encodeURIComponent(schemaIdentifier);
    }
    if (this.preferences.isXSDNewWindow === 'newWindow') {
      window.open(link, 'XSD, top=0,left=0' + windowProperties);
    } else {
      window.open(link, '_blank');
    }
  }

  save2(self) {
    self.save();
    self.nodes = [];
    self.selectedNode = [];
    self.submitXsd = false;
  }

  // validate xml
  validate() {
    this.autoValidate();
    if (_.isEmpty(this.nonValidattribute)) {
      this.validateSer();
      if (this.XSDState && this.XSDState.message && this.XSDState.message.code && this.XSDState.message.code === 'XMLEDITOR-101') {
        this.isDeploy = true;
      }
    } else {
      this.popToast(this.nonValidattribute);
      if (this.nonValidattribute.base) {
        this.error = true;
        this.errorName = {e: this.nonValidattribute.parent};
        this.text = this.requiredField;
      }
      if (this.nonValidattribute.name) {
        this.validateAttr('', this.nonValidattribute);
      }
      this.gotoErrorLocation();
    }
  }

  // toaster pop toast
  popToast(node) {
    let msg;
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
    if (this.errorLocation && this.errorLocation.ref) {
      this.getData(this.errorLocation);
      this.selectedNode = this.errorLocation;
      this.errorLocation = {};
      if (this.errorName && this.errorName.e === this.selectedNode.ref) {
        this.getAutoFocus(0, this.selectedNode, 'value');
      }
      if (this.nodes[0].expanded === false || this.nodes[0].expanded === undefined) {
        this.nodes[0].expanded = true;
        this.autoExpand(this.nodes[0]);
      }
      this.scrollTreeToGivenId(this.selectedNode.uuid);
    }
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
    let r_node;
    let x: any = JSON.parse(result1);
    for (let key in x) {
      rootNode = key;
    }
    let json = this.createTempJson(x, rootNode);
    for (let key in json) {
      r_node = key;
    }
    if (this.nodes[0] && this.nodes[0].ref === rootNode) {
      this.createJsonAccToXsd(json, r_node, this.nodes[0]);
    } else {
      this.nodes = [{}];
      this.createNormalTreeJson(json, r_node, this.nodes[0], '#');
    }
  }

  createTempJson(editJson, rootNode) {
    let temp: any = {};
    if (_.isArray(editJson[rootNode])) {
      for (let i = 0; i < editJson[rootNode].length; i++) {
        temp = Object.assign(temp, this._defineProperty({}, rootNode, editJson[rootNode][i]));
      }
    } else {
      for (let a in editJson[rootNode]) {
        if (a === '_text') {
          a = '_cdata';
        }
        if (a === '_attributes' || a === '_cdata') {
          if (temp[rootNode] === undefined) {
            temp = Object.assign(temp, this._defineProperty({}, rootNode, this._defineProperty({}, a, editJson[rootNode][a])));
          } else {
            temp[rootNode] = Object.assign(temp[rootNode], this._defineProperty({}, a, editJson[rootNode][a]));
          }
        } else {
          if (_.isArray(editJson[rootNode][a])) {
            for (let i = 0; i < editJson[rootNode][a].length; i++) {
              let x = a + '*' + i;
              if (temp[rootNode] === undefined) {
                temp = Object.assign(temp, this._defineProperty({}, rootNode, this._defineProperty({}, x, {})));
              } else {
                temp[rootNode] = Object.assign(temp[rootNode], this._defineProperty({}, x, {}));
              }
              for (let key in editJson[rootNode][a][i]) {
                this.createTempJsonRecursion(key, temp[rootNode][x], editJson[rootNode][a][i]);
              }
            }
          } else {
            if (temp[rootNode] === undefined) {
              temp = Object.assign(temp, this._defineProperty({}, rootNode, this._defineProperty({}, a, {})));
              for (let key in editJson[rootNode][a]) {
                this.createTempJsonRecursion(key, temp[rootNode][a], editJson[rootNode][a]);
              }
            } else {
              temp[rootNode] = Object.assign(temp[rootNode], this._defineProperty({}, a, {}));
              for (let key in editJson[rootNode][a]) {
                this.createTempJsonRecursion(key, temp[rootNode][a], editJson[rootNode][a]);
              }
            }
          }
        }
      }
    }
    this.isLoading = false;
    return temp;
  }

  createTempJsonRecursion(key, tempArr, editJson) {
    if (key === '_text') {
      editJson['_cdata'] = editJson['_text'];
      delete editJson['_text'];
      key = '_cdata';
    }
    if (key === '_attributes' || key === '_cdata') {
      tempArr = Object.assign(tempArr, this._defineProperty({}, key, editJson[key]));
    } else {
      if (editJson && _.isArray(editJson[key])) {
        for (let i = 0; i < editJson[key].length; i++) {
          let x = key + '*' + i;
          tempArr = Object.assign(tempArr, this._defineProperty({}, key, editJson[key]));
          if (editJson) {
            for (let as in editJson[key][i]) {
              this.createTempJsonRecursion(as, tempArr[x], editJson[key][i]);
            }
          }
        }
      } else {
        tempArr = Object.assign(tempArr, this._defineProperty({}, key, {}));
        if (editJson) {
          for (let x in editJson[key]) {
            this.createTempJsonRecursion(x, tempArr[key], editJson[key]);
          }
        }
      }
    }
  }

  createJsonAccToXsd(xmljson, rootNode, mainjson) {
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
        this.addChildForxml(key, rootNode, xmljson, mainjson);
      }
    }
  }

  addChildForxml(key, rootNode, xmljson, mainjson) {
    let a;
    if (key.indexOf('*')) {
      a = key.split('*')[0];
    }
    this.checkChildNode(mainjson, undefined);
    for (let i = 0; i < this.childNode.length; i++) {
      if (a === this.childNode[i].ref) {
        this.childNode[i].import = key;
        this.addChild(this.childNode[i], mainjson, false, i);
      }
    }
    for (let i = 0; i < mainjson.children.length; i++) {
      if (mainjson.children[i].ref === a && mainjson.children[i].import === key) {
        this.createJsonAccToXsd(xmljson[rootNode], key, mainjson.children[i]);
      }
    }
  }

  // create json if xsd not matched
  createNormalTreeJson(xmljson, rootNode, mainjson, parent) {
    let temp = {};
    this.getData(temp);
    let a = undefined;
    if (rootNode.indexOf('*')) {
      a = rootNode.split('*')[0];
    }
    if (a === undefined) {
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
        this.addChildToNormal(key, rootNode, xmljson, mainjson);
      }
    }
  }

  addChildToNormal(key, rootNode, xmljson, mainjson) {
    let temp: any = {};
    let a = undefined;
    if (key.indexOf('*')) {
      a = key.split('*')[0];
    }
    if (a === undefined) {
      temp = Object.assign(temp, {ref: key, parent: rootNode, import: key});
    } else {
      temp = Object.assign(temp, {ref: a, parent: rootNode, import: key});
    }
    mainjson.children.push(temp);
    for (let i = 0; i < mainjson.children.length; i++) {
      if (mainjson.children[i].ref === a && mainjson.children[i].import === key) {
        this.createNormalTreeJson(xmljson[rootNode], key, mainjson.children[i], rootNode);
      }
    }
  }

  removeTag(data) {
    if (data.values && data.values.length > 0) {
      data = data.values[0];
      if (data && data.data && data.data.match(/<[^>]+>/gm)) {
        let x = data.data.replace(/<[^>]+>/gm, '');
        x = x.replace('&nbsp;', ' ');
        return x;
      } else {
        return data.data;
      }
    }
  }

  addCkCss(id) {
    setTimeout(() => {
      $(('#') + id + (' .ck.ck-editor__main>.ck-editor__editable:not(.ck-focused)')).addClass('invalid');
    }, 1);
  }

  removeCkCss(id) {
    setTimeout(() => {
      $(('#') + id + (' .ck.ck-editor__main>.ck-editor__editable:not(.ck-focused)')).removeClass('invalid');
    }, 1);
  }

  addContent(data) {
    if (data && data[0] && data[0].data !== undefined) {
      this.myContent = data[0].data;
    } else {
      this.myContent = '';
    }
  }

  passwordLabel(password: any) {
    if (password && password.values && password.values.length > 0) {
      password = password.values[0].data;
      if (password !== undefined) {
        return '********';
      }
    }
  }

  calcHeight() {
    const a = $('.top-header-bar').outerHeight(true);
    const b = $('.navbar').outerHeight(true);
    const c = $('.white').outerHeight(true);
    const d = $('.attr').outerHeight(true);
    const e = $('.val').outerHeight(true);
    const f = $(window).outerHeight(true);

    if ((d === null || d === 'null') && (e === null || e === 'null')) {

      let x = f - a - b - c - 160;
      $('.documents').css({
        'max-height': x + 'px'
      });
    } else if ((d === null || d === 'null') && (e !== null || e !== 'null')) {
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

  @HostListener('window:beforeunload', ['$event'])
  beforeunload($event) {
    return true;
  }

  private del() {
    if (this.objectType !== 'NOTIFICATION' && this.activeTab.id < 0) {
      for (let i = 0; i < this.tabsArray.length; i++) {
        if (this.tabsArray[i].id === this.activeTab.id) {
          this.tabsArray.splice(i, 1);
          break;
        }
      }
      if (this.tabsArray.length > 0) {
        this.changeTab(this.tabsArray[this.tabsArray.length - 1], true);
      }
      return;
    }
    let obj: any = {
      controllerId: this.schedulerIds.selected,
      objectType: this.objectType,
    };
    if (this.objectType !== 'NOTIFICATION') {
      obj.id = this.activeTab.id;
    }
    this.coreService.post('xmleditor/delete', obj).subscribe((res: any) => {
      if (res.configuration) {
        if (!this.ok(res.configuration)) {
          let obj1: any = {
            controllerId: this.schedulerIds.selected,
            objectType: this.objectType,
            configuration: res.configuration
          };
          if (this.objectType !== 'NOTIFICATION') {
            obj1.schemaIdentifier = this.schemaIdentifier;
          }
          this.coreService.post('xmleditor/xml2json', obj1).subscribe((result: any) => {
            this.isLoading = true;
            let a = [];
            let arr = JSON.parse(result.configurationJson);
            a.push(arr);
            this.counting = arr.lastUuid;
            this.doc = new DOMParser().parseFromString(this.path, 'application/xml');
            this.nodes = a;
            this.getIndividualData(this.nodes[0], undefined);
            this.isLoading = false;
            this.selectedNode = this.nodes[0];
            this.XSDState = res.state;
            this.submitXsd = true;
            this.isDeploy = res.state.deployed;
            if (res.state.deployed) {
              this.validConfig = true;
            }
            this.prevXML = this.removeComment(res.configuration);
            this.copyItem = undefined;
          }, (err) => {
            this.isLoading = false;
            this.error = true;
            this.toasterService.pop('error', err.data.error.message);
          });
        } else {
          this.nodes = [];
          this.submitXsd = false;
          this.isLoading = false;
          this.XSDState = res.state;
          if (this.objectType !== 'NOTIFICATION') {
            this.tabsArray = this.tabsArray.filter(x => {
              return x.id !== this.activeTab.id;
            });
            if (this.tabsArray.length > 0) {
              if (this.activeTab.schemaIdentifier !== undefined) {
                // this.selectedXsd = true;
              }
              this.selectedTabIndex = 0;
              this.changeTab(this.tabsArray[0], true);

            }
          }
          // this.openXMLDialog();
        }
      } else {
        this.nodes = [];
        this.submitXsd = false;
        this.isLoading = false;
        this.XSDState = res.state;
        if (this.objectType !== 'NOTIFICATION') {
          this.schemaIdentifier = undefined;
          this.tabsArray = this.tabsArray.filter(x => {
            return x.id !== this.activeTab.id;
          });
          if (this.tabsArray.length > 0) {
            this.selectedTabIndex = 0;
            this.changeTab(this.tabsArray[0], true);

          }
        }
      }
    }, (error) => {
      this.toasterService.pop('error', error.error.message);
    });
  }

  private showError(error) {
    let iNode = {
      eleName: error.elementName,
      elePos: error.elementPosition.split('-')
    };
    this.gotoInfectedElement(iNode, this.nodes);
    this.validConfig = false;
    this.getIndividualData(this.selectedNode, true);
    this.toasterService.pop('error', error.message);
  }

  private gotoInfectedElement(node, nodes) {
    for (let j = 0; j < nodes.length; j++) {
      if (node.elePos[0] == j + 1) {
        nodes[j].expanded = true;
        this.autoExpand(nodes[j]);
        node.elePos.splice(0, 1);
        if (node.elePos.length > 0) {
          this.gotoInfectedElement(node, nodes[j].children);
        } else {
          this.autoExpand(nodes[j]);
          nodes[j].expanded = true;
          this.selectedNode = nodes[j];
        }
        break;
      }
    }
  }

  private storeXML(cb) {
    if (!this.permission || !this.permission.YADE || !this.permission.YADE.configurations.edit) {
      return;
    }
    this._xml = this._showXml();
    if (!this._xml) {
      return;
    }
    let eRes;
    if (this.prevXML && this._xml) {
      eRes = this.compare(this.prevXML.toString(), this._xml.toString());
    }
    if (!eRes && this.objectType === 'NOTIFICATION') {
      this.coreService.post('xmleditor/store', {
        controllerId: this.schedulerIds.selected,
        objectType: this.objectType,
        configuration: this._xml,
        configurationJson: JSON.stringify({nodesCount: this.counting, node: this.nodes}),
      }).subscribe((res: any) => {
        this.isDeploy = false;
        this.XSDState = Object.assign({}, {message: res.message});
        this.XSDState.modified = res.modified;
        this.prevXML = this._xml;
      }, (error) => {
        this.toasterService.pop('error', error.error.message);
      });
    } else if (!eRes) {
      this.coreService.post('xmleditor/store', {
        controllerId: this.schedulerIds.selected,
        objectType: this.objectType,
        configuration: this._xml,
        configurationJson: JSON.stringify({nodesCount: this.counting, node: this.nodes}),
        id: this.activeTab.id,
        name: this.activeTab.name,
        schemaIdentifier: this.schemaIdentifier,
        schema: this.path
      }).subscribe((res: any) => {
        this.isDeploy = false;
        this.XSDState = Object.assign({}, {message: res.message});
        this.XSDState.modified = res.modified;
        this.prevXML = this._xml;
        this.activeTab.id = res.id;
        if (cb) {
          this.storeXML(undefined);
        }
      }, (error) => {
        this.toasterService.pop('error', error.error.message);
      });
    } else {
      if (cb) {
        cb();
      }
    }
  }

  private compare(str1, str2) {
    let a = str1.replace(/\s/g, '');
    let b = str2.replace(/\s/g, '');
    return _.isEqual(a, b);
  }

  private getNodeRulesData(node) {
    if (!node.recreateJson) {
      let nod = {ref: node.parent};
      let a = this.checkChildNode(nod, undefined);
      if (a && a.length > 0) {
        for (let i = 0; i < a.length; i++) {
          if (a[i].ref === node.ref) {
            node = Object.assign(node, a[i]);
          }
        }
      }
      a = this.checkChildNode(node, undefined);
      if (a && a.length > 0) {
        for (let i = 0; i < a.length; i++) {
          for (let j = 0; j < node.children.length; j++) {
            if (a[i].ref === node.children[j].ref) {
              node.children[j] = Object.assign(node.children[j], a[i]);
            }
          }
        }
      }
    }
  }

  private scrollTree(id, cb) {
    const dom = $('#' + id);
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

  private removeComment(data) {
    let d = data.replace(/\<\!\-\-((?!\-\-\>)[\s\S])*\-\-\>\s*/g, '');
    return d.replace(/(\\n)/g, '');
  }

  private handleNodeToExpandAtOnce(nodes, path, _tempArrToExpand) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].expanded) {
        if (!path) {
          nodes[i].path = nodes[i].parent + '/' + nodes[i].ref;
        } else {
          nodes[i].path = path + '/' + nodes[i].ref;
        }
        if (nodes[i].children && nodes[i].children.length) {
          if (nodes[i].path.split('/').length === 10) {
            _tempArrToExpand.push(nodes[i]);
            nodes[i].expanded = false;
          }
          this.handleNodeToExpandAtOnce(nodes[i].children, nodes[i].path, _tempArrToExpand);
        }
      }
    }
  }

  private copyNodeRecursion(node) {
    let tempa = {};
    for (let key in node) {
      if (typeof (node[key]) === 'object') {
        tempa = Object.assign({}, tempa, this._defineProperty({}, key, []));
        if ((key === 'attributes' || key === 'values') && node[key].length > 0) {
          for (let i = 0; i < node[key].length; i++) {
            let temp = {};
            for (let a in node[key][i]) {
              if (a === 'id') {
                temp = Object.assign(temp, this._defineProperty({}, a, this.counting));
                this.counting++;
              } else {
                temp = Object.assign(temp, this._defineProperty({}, a, node[key][i][a]));
              }
            }
            tempa[key].push(Object.assign({}, temp));
          }
        } else if (key === 'nodes' && node[key].length > 0) {
          for (let i = 0; i < node[key].length; i++) {
            let a = this.copyNodeRecursion(node[key][i]);
            tempa[key].push(a);
          }
        } else if (key === 'text') {
          tempa = Object.assign({}, tempa, this._defineProperty({}, key, node[key]));
        }
      } else {
        tempa = Object.assign({}, tempa, this._defineProperty({}, key, node[key]));
      }
    }
    return tempa;
  }

  private changeParentId(node, parentId) {
    node.parentId = parentId;
    if (node && node.children && node.children.length > 0) {
      node.children.forEach((cNode) => {
        this.changeParentId(cNode, node.uuid);
      });
    }
  }

  private changeUuId(node, id) {
    node.uuid = id + this.counting;
    node.key = id + this.counting;
    this.counting++;
    if (node && node.children && node.children.length > 0) {
      node.children.forEach((cNode) => {
        this.changeUuId(cNode, node.uuid);
      });
    }
  }

  private getAllChild(list: any) {
    for (let child in list) {
      list[child].children = [];
      this.checkChildNode(list[child], list[child]);
    }
  }

  private xmlToJsonService(data) {
    let obj: any = {
      controllerId: this.schedulerIds.selected,
      objectType: this.objectType,
      configuration: data
    };
    if (this.objectType !== 'NOTIFICATION') {
      obj.schemaIdentifier = this.schemaIdentifier;
    }
    this.coreService.post('xmleditor/xml2json', obj).subscribe((res: any) => {
      this.validConfig = false;
      let a = [];
      let arr = JSON.parse(res.configurationJson);
      a.push(arr);
      this.counting = arr.lastUuid;
      this.doc = new DOMParser().parseFromString(this.path, 'application/xml');
      this.addKey(a);
      this.nodes = a;
      this.getIndividualData(this.nodes[0], undefined);
      this.selectedNode = this.nodes[0];
      this.isLoading = false;
      this.submitXsd = true;
      this.isDeploy = true;
      this.XSDState = {};
      this.prevXML = '';
      this.storeXML(undefined);
    }, () => {
      this.importObj = {};
      this.isLoading = false;
    });
  }

  private openXMLDialog(data) {
    this.editorOptions.readOnly = false;
    this.objectXml = {};
    this.objectXml.isXMLEditor = true;
    this.objectXml.xml = data;
    const modalRef = this.modalService.open(ShowModalComponent, {size: 'lg', backdrop: 'static', windowClass: 'script-editor'});
    modalRef.result.then(() => {

    }, () => {
      this.objectXml = {};
      this.toasterService.clear();
    });
  }

  private newConf() {
    const obj: any = {
      controllerId: this.schedulerIds.selected,
      objectType: this.objectType,
    };
    if (this._xml) {
      obj.configuration = this._xml;
    }
    this.coreService.post('xmleditor/read', obj).subscribe((res: any) => {
      this.schemaIdentifier = res.schemaIdentifier;
      if (res.schema) {
        this.path = res.schema;
        this.loadTree(res.schema, false);
        this.submitXsd = true;
        this.isDeploy = false;
        this.XSDState = res.state;
        this.XSDState.modified = res.modified;
        this.prevXML = '';
        this.storeXML(undefined);
      }
    }, (err) => {
      this.submitXsd = false;
      this.isLoading = false;
      this.XSDState = '';
      this.error = true;
      this.toasterService.pop('error', err.data.error.message);
    });
  }

  private validateSer() {
    this._xml = this._showXml();
    const obj: any = {
      controllerId: this.schedulerIds.selected,
      objectType: this.objectType,
      configuration: this._xml
    };
    if (this.objectType !== 'NOTIFICATION') {
      obj.schemaIdentifier = this.schemaIdentifier;
    }
    this.coreService.post('xmleditor/validate', obj).subscribe((res: any) => {
      if (res.validationError) {
        this.showError(res.validationError);
      } else {
        this.validConfig = true;
      }
    }, (error) => {
      this.validConfig = false;
      if (error.error) {
        this.toasterService.pop('error', error.error.message);
      }
    });
  }

  private _showXml() {
    const xml = this.jsonToXml();
    const xmlAsString = new XMLSerializer().serializeToString(xml);
    let a = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>`;
    a = a.concat(xmlAsString);
    return vkbeautify.xml(a);
  }

  hidePanel() {
    this.sideView.xml.show = false;
    this.coreService.hideConfigPanel();
  }

  showPanel() {
    this.sideView.xml.show = true;
    this.coreService.showConfigPanel();
  }
}
