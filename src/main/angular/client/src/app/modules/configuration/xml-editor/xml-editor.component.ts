import {Component, Input, OnInit, ViewChild, OnDestroy, HostListener, AfterViewInit} from '@angular/core';
import {CoreService} from '../../../services/core.service';
import {TranslateService} from '@ngx-translate/core';
import {ToasterService} from 'angular2-toaster';
import {saveAs} from 'file-saver';
import * as _ from 'underscore';
import {FileUploader} from 'ng2-file-upload';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DataService} from '../../admin/data.service';
import {Subscription, of} from 'rxjs';
import {Router} from '@angular/router';
import {AuthService} from '../../../components/guard';
import {NzFormatEmitEvent, NzTreeNode, NzFormatBeforeDropEvent} from 'ng-zorro-antd';

declare const require;
declare const vkbeautify;
declare const $;

const xpath = require('xpath');
const convert = require('xml-js');

@Component({
  selector: 'app-modal-child-content',
  templateUrl: './show-childs-dialog.html'
})

export class ShowChildModalComponent implements OnInit {
  counter = 0;
  data: string;
  options: any = {};
  selectedNode: any;
  @Input() doc: any;

  isExpandAll = false;

  nodes = [];
  @Input() showAllChild: any;

  constructor(public activeModal: NgbActiveModal, public coreService: CoreService) {

  }

  ngOnInit(): void {
    this.getText(this.showAllChild[0]);
    this.printTreeArray();
    const obj: any = this.showAllChild[0];
    obj.title = obj.ref;
    // tslint:disable-next-line: forin
    for (const child in obj.children) {
      obj.children[child].children = [];
      obj.children[child].title = obj.children[child].ref;
      this.checkChildNode(obj.children[child], obj.children[child]);
      this.recursiveGetAllChilds(obj.children[child].children);
    }
  }

  recursiveGetAllChilds(list: any) {
    // tslint:disable-next-line: forin
    for (const child in list) {
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
      const node = data.node;
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
    const select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let text: any = {};
    const documentationPath2 = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:annotation/xs:documentation';
    const element2 = select(documentationPath2, this.doc);
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
    const checkExpand = {expanded: false, parent: this.showAllChild};
    for (let i = 0; i < this.showAllChild.length; i++) {
      this.showAllChild[i].isSearch = false;
      if (q) {
        const pattern = new RegExp('(' + q + ')', 'gi');
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
        const pattern = new RegExp('(' + q + ')', 'gi');
        if (pattern.test(arr[i].ref)) {
          arr[i].isSearch = true;
          ++count;
          if (count > 0 && !checkExpand.isExpand) {
            checkExpand.parent.expanded = true;
            for (let j = 2; j < 10; j++) {
              const key = 'parent' + j;
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
    const node = showAllChild.ref;
    let parentNode;
    const select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    const complexTypePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType';
    const TypePath = '/xs:schema/xs:element[@name=\'' + node + '\']';
    let nodes: any = {};
    const childArr: any = [];
    const element = select(complexTypePath, this.doc);
    if (element.length > 0) {
      const sequencePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence';
      const choicePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:choice';
      const childFromBasePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:complexContent/xs:extension/@base';
      // tslint:disable-next-line: max-line-length
      const complexContentWithElementPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:complexContent/xs:extension/xs:sequence/xs:element';
      const childs = select(childFromBasePath, this.doc);
      const element1 = select(sequencePath, this.doc);
      if (element1.length > 0) {
        const cPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:element';
        const cElement = select(cPath, this.doc);
        if (cElement.length > 0) {
          for (let i = 0; i < cElement.length; i++) {
            nodes = {};
            for (let j = 0; j < cElement[i].attributes.length; j++) {
              const a = cElement[i].attributes[j].nodeName;
              const b = cElement[i].attributes[j].nodeValue;
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
        const dPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:choice/xs:element';
        const dElement = select(dPath, this.doc);
        if (dElement.length > 0) {
          for (let i = 0; i < dElement.length; i++) {
            nodes = {};
            for (let j = 0; j < dElement[i].attributes.length; j++) {
              const a = dElement[i].attributes[j].nodeName;
              const b = dElement[i].attributes[j].nodeValue;
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
        const ePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:choice/xs:sequence/xs:element';
        const eElement = select(ePath, this.doc);
        if (eElement.length > 0) {
          for (let i = 0; i < eElement.length; i++) {
            nodes = {};
            for (let j = 0; j < eElement[i].attributes.length; j++) {
              const a = eElement[i].attributes[j].nodeName;
              const b = eElement[i].attributes[j].nodeValue;
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
        const childPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:choice/xs:element';
        const childs1 = select(childPath, this.doc);
        if (childs1.length > 0) {
          for (let i = 0; i < childs1.length; i++) {
            nodes = {};
            for (let j = 0; j < childs1[i].attributes.length; j++) {
              const a = childs1[i].attributes[j].nodeName;
              const b = childs1[i].attributes[j].nodeValue;
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
          const childPath2 = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:choice/xs:sequence/xs:element';
          const child12 = select(childPath2, this.doc);
          if (child12.length > 0) {
            for (let i = 0; i < child12.length; i++) {
              nodes = {};
              for (let j = 0; j < child12[i].attributes.length; j++) {
                const a = child12[i].attributes[j].nodeName;
                const b = child12[i].attributes[j].nodeValue;
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
          const childrenPath = '/xs:schema/xs:complexType[@name=\'' + childs[0].nodeValue + '\']/xs:sequence/xs:element';
          const sElement = select(childrenPath, this.doc);
          if (sElement.length > 0) {
            for (let i = 0; i < sElement.length; i++) {
              nodes = {};
              for (let j = 0; j < sElement[i].attributes.length; j++) {
                const a = sElement[i].attributes[j].nodeName;
                const b = sElement[i].attributes[j].nodeValue;
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
            const childrenPath1 = '/xs:schema/xs:complexType[@name=\'' + childs[0].nodeValue + '\']/xs:choice/xs:element';
            const elementx = select(childrenPath1, this.doc);
            if (elementx.length > 0) {
              for (let i = 0; i < elementx.length; i++) {
                nodes = {};
                for (let j = 0; j < elementx[i].attributes.length; j++) {
                  const a = elementx[i].attributes[j].nodeName;
                  const b = elementx[i].attributes[j].nodeValue;
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
              const ele = select(complexContentWithElementPath, this.doc);
              for (let i = 0; i < ele.length; i++) {
                nodes = {};
                for (let j = 0; j < ele[i].attributes.length; j++) {
                  const a = ele[i].attributes[j].nodeName;
                  const b = ele[i].attributes[j].nodeValue;
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
      const typeElement = select(TypePath, this.doc);
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
              const b = typeElement[0].attributes[j].nodeValue;
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
    const select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    const complexTypePath = '/xs:schema/xs:complexType[@name=\'' + node + '\']';
    const TypePath = '/xs:schema/xs:element[@name=\'' + node + '\']';
    let nodes: any = {};
    const childArr: any = [];
    const element = select(complexTypePath, this.doc);
    if (element.length > 0) {
      const sequencePath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence';
      const element1 = select(sequencePath, this.doc);
      if (element1.length > 0) {
        const childPath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence/xs:element';
        const childs = select(childPath, this.doc);
        if (childs.length > 0) {
          for (let i = 0; i < childs.length; i++) {
            nodes = {};
            for (let j = 0; j < childs[i].attributes.length; j++) {
              const a = childs[i].attributes[j].nodeName;
              const b = childs[i].attributes[j].nodeValue;
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
        const seqChoicePath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence/xs:choice/xs:element';
        const getChildChoice = select(seqChoicePath, this.doc);
        if (getChildChoice.length > 0) {
          for (let i = 0; i < getChildChoice.length; i++) {
            nodes = {};
            for (let j = 0; j < getChildChoice[i].attributes.length; j++) {
              const a = getChildChoice[i].attributes[j].nodeName;
              const b = getChildChoice[i].attributes[j].nodeValue;
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
        const seqChoiceSeqPath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence/xs:choice/xs:sequence/xs:element';
        const getChildChoiceSeq = select(seqChoiceSeqPath, this.doc);
        if (getChildChoiceSeq.length > 0) {
          for (let i = 0; i < getChildChoiceSeq.length; i++) {
            nodes = {};
            for (let j = 0; j < getChildChoiceSeq[i].attributes.length; j++) {
              const a = getChildChoiceSeq[i].attributes[j].nodeName;
              const b = getChildChoiceSeq[i].attributes[j].nodeValue;
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
      const choicePath = '//xs:complexType[@name=\'' + node + '\']/xs:choice';
      if ((select(choicePath, this.doc)).length) {
        const childPath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:choice/xs:element';
        const childs = select(childPath, this.doc);
        if (childs.length > 0) {
          for (let i = 0; i < childs.length; i++) {
            nodes = {};
            for (let j = 0; j < childs[i].attributes.length; j++) {
              const a = childs[i].attributes[j].nodeName;
              const b = childs[i].attributes[j].nodeValue;
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
      const typeElement = select(TypePath, this.doc);
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
  selector: 'app-ngbd-modal-content',
  templateUrl: './show-dialog.html'
})
export class ShowModalComponent {
  @Input() xml: any;
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

  constructor(public activeModal: NgbActiveModal,
              public coreService: CoreService,
              private toasterService: ToasterService) {
  }

  copyToClipboard() {

  }

  validateXML() {
    const obj: any = {
      jobschedulerId: this.schedulerId,
      objectType: this.objectType,
      configuration: this.xml
    };
    if (this.objectType === 'OTHER') {
      obj.schemaIdentifier = this.activeTab.schemaIdentifier;
    }
    this.coreService.post('xmleditor/validate', obj).subscribe((res: any) => {
      if (res.validationError) {
        this.highlightLineNo(res.validationError.line);
        this.toasterService.pop('error', res.validationError.message);
      } else {
        this.toasterService.clear();
        // this.toasterService.pop('success', xml.message.validateSuccessfully);
      }
    }, (error) => {
      if (error.data && error.data.error) {
        this.toasterService.pop('error', error.data.error.message);
      }
    });
  }

  cancel() {
    this.activeModal.close();
  }

  submitXML() {
    const data = this.xml;
    const obj: any = {
      jobschedulerId: this.schedulerId,
      objectType: this.objectType,
      configuration: data
    };
    if (this.objectType === 'OTHER') {
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
      console.log(error);
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
        lNum = _.clone(num - parseInt(dom[0].children[0].innerText.split(' ')[0].split('↵')[0]) + 1);
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
  selector: 'app-ngbd-modal-content',
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
  selectedXsd: any;
  assignXsd: any;
  uploadData: any;
  url;

  constructor(public activeModal: NgbActiveModal,
    public modalService: NgbModal,
    public translate: TranslateService,
    public toasterService: ToasterService,
    private router: Router
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

    this.uploader.onBeforeUploadItem = (item: any) => {

    };

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
    const item = event['0'];
    const fileExt = item.name.slice(item.name.lastIndexOf('.') + 1).toUpperCase();
    if (!this.importXsd) {
      if (fileExt !== 'XML') {
        this.toasterService.pop('error', '', fileExt + ' ' + 'invalid file type');
        event.remove();
      } else {
        this.fileLoading = false;
        const reader = new FileReader();
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
        const reader = new FileReader();
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

  onSubmitXSD() {
    this.activeModal.close({uploadData: this.uploadData, importObj: this.importObj});
  }

  cancel() {
    this.activeModal.close('');
  }
}

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './confirmation-dialog.html'
})
export class ConfirmationModalComponent implements OnInit {
  @Input() save;
  @Input() self;
  @Input() assignXsd;
  @Input() delete;
  @Input() deleteAll;
  @Input() objectType;
  @Input() activeTab;

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
  }

  confirmMessage(message) {
    if (message === 'yes') {
      if (!this.delete) {
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
  selector: 'app-ngbd-modal-content',
  templateUrl: './diff-dialog.html'
})
export class DiffPatchModalComponent implements OnInit {
  @Input() liveXml;
  @Input() draftXml;
  @Input() xmlVersionObj;

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
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
  dragFrom: any;
  dragTo: any;
  dropCheck = false;
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
  prevErrLine: any;
  deleteAll: boolean;
  delete: boolean;
  tabsArray = [];
  oldName: any = {};
  tab: any;
  showSelectSchema: any;
  _activeTab: any;
  reassignSchema: boolean;
  importXSDFile: boolean;
  uploadData: any;
  xmlVersionObj: any;
  draftXml: any;
  liveXml: any;
  selectedTabIndex = 0;
  counter: number;
  @ViewChild('myckeditor', {static: false}) ckeditor: any;
  @ViewChild('treeCtrl', {static: false}) treeCtrl: any;
  // translate messages
  requiredField: string;
  spaceNotAllowed: string;
  cannotAddBlankSpace: string;
  onlyPositiveNumbers: string;
  cannotNegative: string;
  colonNotAllowed: string;
  notValidUrl: string;
  uniqueName: string;
  onlyNumbers: string;
  tempParentNode: any
  config: any = {toolbar: [
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
    ], allowedContent : true};

  intervalId:any;

  openFolder(data: NzTreeNode | NzFormatEmitEvent): void {
    if (data instanceof NzTreeNode) {
      data.isExpanded = !data.isExpanded;
    } else {
      const node = data.node;
      if (node) {
        node.isExpanded = !node.isExpanded;
      }
    }
  }

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

  deleteAllConf() {
    this.deleteAll = true;
    this.delete = false;
    const modalRef = this.modalService.open(ConfirmationModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.deleteAll = true;
    modalRef.componentInstance.objectType = this.objectType;
    modalRef.result.then((res: any) => {
      const obj = {
        jobschedulerId: this.schedulerIds.selected,
        objectTypes: ['OTHER'],
      };
      this.coreService.post('xmleditor/delete/all', obj).subscribe((res: any) => {
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

  //delete config
  deleteConf() {
    this.delete = true;
    this.deleteAll = false;
    const modalRef = this.modalService.open(ConfirmationModalComponent, {backdrop: 'static', size: 'sm'});
    modalRef.componentInstance.delete = this.delete;
    modalRef.componentInstance.deleteAll = this.deleteAll;
    modalRef.componentInstance.objectType = this.objectType;
    if (this.objectType === 'OTHER') {
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
        jobschedulerId: this.schedulerIds.selected,
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
        this.toasterService.pop('error', error.data.error.message);
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
    if (!data.schemaIdentifier) {
      // this._activeTab.isVisible = true;
    } else {
      // this._activeTab.isVisible = false;
    }
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

  ngOnInit() {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};

    const url = this.router.url.split('/')[2];
    this.objectType = url.toUpperCase();
    if (url === 'notification') {
      this.selectedXsd = 'systemMonitorNotification';
    } else if (url === 'yade') {
      this.selectedXsd = url;
    }
    if (this.selectedXsd !== '' && this.objectType !== 'OTHER') {
      this.readXML();
    } else {
      this.othersXSD();
    }
    this.intervalId = setInterval(() => {
      if (this.submitXsd && !this.objectXml.xml) {
        this.storeXML(undefined);
      }
    }, 3000);

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

  othersXSD() {
    this.submitXsd = false;
    this.coreService.post('xmleditor/read', {
      jobschedulerId: this.schedulerIds.selected,
      objectType: this.objectType
    }).subscribe((res: any) => {
      if (res.schemas) {
        this.otherSchema = res.schemas;
        localStorage.setItem('schemas', this.otherSchema);
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
      if (error.data && error.data.error) {
        this.toasterService.pop('error', error.data.error.message);
      }
    });
  }

  readOthersXSD(id) {
    this.nodes = [];
    this.selectedNode = [];
    this.coreService.post('xmleditor/read', {
      jobschedulerId: this.schedulerIds.selected,
      objectType: this.objectType,
      id: id
    }).subscribe((res: any) => {
      if (!res.configuration) {
        this.showSelectSchema = true;
        this.submitXsd = false;
        this.schemaIdentifier = undefined;
        this.otherSchema = res.schemas;
        localStorage.setItem('schemas', this.otherSchema);
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
            res.configuration.state.modified = res.configuration.modified;
            this.XSDState = res.configuration.state;
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
          if (this.objectType === 'OTHER' && this._activeTab) {
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
    const obj = {
      jobschedulerId: this.schedulerIds.selected,
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
        const _tempArrToExpand = [];
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
          const a = [jsonArray];
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

  setDropdownPosition(data, e) {
    $('[data-toggle="popover"]').popover('hide');
    const top = e.clientY + 8;
    const left = e.clientX - 20;
    if (window.innerHeight > top + (180 + ((this.childNode.length > 5 ? 5 : this.childNode.length) * 22))) {
      $('.list-dropdown').css({top: top + 'px', left: left + 'px', bottom: 'auto'})
        .removeClass('arrow-down').addClass('dropdown-ac');
      const dom = $('#zoomCn');
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
        top: 'auto',
        left: left + 'px',
        bottom: (window.innerHeight - top + 14) + 'px'
      }).addClass('arrow-down').removeClass('dropdown-ac');
    }
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
    const attrs = this.checkAttributes(node.ref);
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
    const value = this.getValues(node.ref);
    if (node.values && node.values.length > 0) {
      for (let i = 0; i < value.length; i++) {
        for (let j = 0; j < node.values.length; j++) {
          if (value[i].parent === node.values[j].parent) {
            value[i] = Object.assign(value[i], node.values[j]);
          }
        }
      }
    }
    const attrsType = this.getAttrFromType(node.ref, node.parent);
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
    const valueType = this.getValueFromType(node.ref, node.parent);

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
      // const someNode = this.treeCtrl.treeModel.getNodeById(node.parentId);
      // if (someNode) {
      //   someNode.expand();
      // }
      // if (someNode && someNode.data && someNode.data.parent !== '#') {
      //   this.getParentToExpand(someNode.data);
      // }
    }
  }

  ok(conf) {
    const dom_parser = new DOMParser();
    const dom_document = dom_parser.parseFromString(conf, 'text/xml');
    try {
      if (dom_document.documentElement.getElementsByTagName('parsererror').length > 0
        || dom_document.documentElement.nodeName === 'parsererror') {
        if (dom_document.documentElement.getElementsByTagName('parsererror').length > 0) {
          const a: any = dom_document.documentElement.getElementsByTagName('parsererror')[0];
          this.toasterService.pop('error', 'Invalid xml ' + a.innerText);
        } else {
          this.toasterService.pop('error', 'Invalid xml ' + dom_document.documentElement.firstChild.nodeValue);
        }
        return true;
      } else {
        return false;
      }
    } catch (e) {
      const a: any = dom_document.documentElement.getElementsByTagName('parsererror')[0];
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
    if (localStorage.getItem('schemas')) {
      this.otherSchema = localStorage.getItem('schemas').split(',');
    }
  }

  getRootNode(doc, check) {
    let temp: any;
    let attrs: any;
    let child: any;
    const select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    const rootElementPath = '//xs:element';
    const root = select(rootElementPath, doc);
    for (let i = 0; i < root[0].attributes.length; i++) {
      const b = root[0].attributes[i].nodeValue;
      temp = Object.assign({}, {ref: b});
    }
    temp.parent = '#';
    temp.uuid = this.counting;
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
    const text = this.checkText(temp.ref);
    if (text) {
      temp.text = text;
    }
    if (!check) {
      child = this.checkChildNode(temp, undefined);
      if (child.length > 0) {
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
    const select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    const complexTypePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType';
    let attribute: any = {};
    const attrsArr: any = [];
    const element = select(complexTypePath, this.doc);
    if (element.length > 0) {
      const attrsPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:attribute';
      const attrs = select(attrsPath, this.doc);
      if (attrs.length > 0) {
        for (let i = 0; i < attrs.length; i++) {
          attribute = {};
          let x;
          for (let j = 0; j < attrs[i].attributes.length; j++) {
            const a = attrs[i].attributes[j].nodeName;
            const b = attrs[i].attributes[j].nodeValue;
            attribute = Object.assign(attribute, {[a]: b});
            // tslint:disable-next-line: max-line-length
            const valueFromXmlEditorPath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:attribute[@name=\'' + b + '\']/xs:annotation/xs:appinfo/XmlEditor';
            const attr1 = select(valueFromXmlEditorPath, this.doc);
            if (attr1.length > 0) {
              if (attr1[0].attributes && attr1[0].attributes.length > 0) {
                for (let k = 0; k < attr1[0].attributes.length; k++) {
                  if (attr1[0].attributes[k].nodeName === 'type') {
                    x = attr1[0].attributes[k].nodeValue;
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
    if (element.length > 0) {
      const attrsPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:complexContent/xs:extension/xs:attribute';
      const attrs = select(attrsPath, this.doc);
      if (attrs.length > 0) {
        for (let i = 0; i < attrs.length; i++) {
          attribute = {};
          let x;
          for (let j = 0; j < attrs[i].attributes.length; j++) {
            const a = attrs[i].attributes[j].nodeName;
            const b = attrs[i].attributes[j].nodeValue;
            attribute = Object.assign(attribute, {[a]: b});
            // tslint:disable-next-line: max-line-length
            const valueFromXmlEditorPath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:attribute[@name=\'' + b + '\']/xs:annotation/xs:appinfo/XmlEditor';
            const attr1 = select(valueFromXmlEditorPath, this.doc);
            if (attr1.length > 0) {
              if (attr1[0].attributes && attr1[0].attributes.length > 0) {
                for (let k = 0; k < attr1[0].attributes.length; k++) {
                  if (attr1[0].attributes[k].nodeName === 'type') {
                    x = attr1[0].attributes[k].nodeValue;
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
    if (element.length > 0) {
      const attrsPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:simpleContent/xs:extension/xs:attribute';
      const attrs = select(attrsPath, this.doc);
      if (attrs.length > 0) {
        for (let i = 0; i < attrs.length; i++) {
          attribute = {};
          let x;
          for (let j = 0; j < attrs[i].attributes.length; j++) {
            const a = attrs[i].attributes[j].nodeName;
            const b = attrs[i].attributes[j].nodeValue;
            attribute = Object.assign(attribute, {[a]: b});
            // tslint:disable-next-line: max-line-length
            const valueFromXmlEditorPath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:attribute[@name=\'' + b + '\']/xs:annotation/xs:appinfo/XmlEditor';
            const attr1 = select(valueFromXmlEditorPath, this.doc);
            if (attr1.length > 0) {
              if (attr1[0].attributes && attr1[0].attributes.length > 0) {
                for (let k = 0; k < attr1[0].attributes.length; k++) {
                  if (attr1[0].attributes[k].nodeName === 'type') {
                    x = attr1[0].attributes[k].nodeValue;
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
    return attrsArr;
  }

  checkChildNode(showAllChild, data) {
    const node = showAllChild.ref;
    let parentNode;
    if (!data) {
      this.childNode = [];
    }
    const select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    const complexTypePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType';
    const TypePath = '/xs:schema/xs:element[@name=\'' + node + '\']';
    let nodes: any = {};
    const childArr: any = [];
    const element = select(complexTypePath, this.doc);
    if (element.length > 0) {
      const sequencePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence';
      const choicePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:choice';
      const childFromBasePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:complexContent/xs:extension/@base';
      // tslint:disable-next-line: max-line-length
      const complexContentWithElementPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:complexContent/xs:extension/xs:sequence/xs:element';
      const childs = select(childFromBasePath, this.doc);
      const element1 = select(sequencePath, this.doc);
      if (element1.length > 0) {
        const cPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:element';
        const cElement = select(cPath, this.doc);
        if (cElement.length > 0) {
          for (let i = 0; i < cElement.length; i++) {
            nodes = {};
            for (let j = 0; j < cElement[i].attributes.length; j++) {
              const a = cElement[i].attributes[j].nodeName;
              const b = cElement[i].attributes[j].nodeValue;
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
        const dPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:choice/xs:element';
        const dElement = select(dPath, this.doc);
        if (dElement.length > 0) {
          for (let i = 0; i < dElement.length; i++) {
            nodes = {};
            for (let j = 0; j < dElement[i].attributes.length; j++) {
              const a = dElement[i].attributes[j].nodeName;
              const b = dElement[i].attributes[j].nodeValue;
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
        const ePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:choice/xs:sequence/xs:element';
        const eElement = select(ePath, this.doc);
        if (eElement.length > 0) {
          for (let i = 0; i < eElement.length; i++) {
            nodes = {};
            for (let j = 0; j < eElement[i].attributes.length; j++) {
              const a = eElement[i].attributes[j].nodeName;
              const b = eElement[i].attributes[j].nodeValue;
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
        const childPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:choice/xs:element';
        const childs1 = select(childPath, this.doc);
        if (childs1.length > 0) {
          for (let i = 0; i < childs1.length; i++) {
            nodes = {};
            for (let j = 0; j < childs1[i].attributes.length; j++) {
              const a = childs1[i].attributes[j].nodeName;
              const b = childs1[i].attributes[j].nodeValue;
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
          const childPath2 = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:choice/xs:sequence/xs:element';
          const child12 = select(childPath2, this.doc);
          if (child12.length > 0) {
            for (let i = 0; i < child12.length; i++) {
              nodes = {};
              for (let j = 0; j < child12[i].attributes.length; j++) {
                const a = child12[i].attributes[j].nodeName;
                const b = child12[i].attributes[j].nodeValue;
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
          const childrenPath = '/xs:schema/xs:complexType[@name=\'' + childs[0].nodeValue + '\']/xs:sequence/xs:element';
          const sElement = select(childrenPath, this.doc);
          if (sElement.length > 0) {
            for (let i = 0; i < sElement.length; i++) {
              nodes = {};
              for (let j = 0; j < sElement[i].attributes.length; j++) {
                const a = sElement[i].attributes[j].nodeName;
                const b = sElement[i].attributes[j].nodeValue;
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
            const childrenPath1 = '/xs:schema/xs:complexType[@name=\'' + childs[0].nodeValue + '\']/xs:choice/xs:element';
            const elementx = select(childrenPath1, this.doc);
            if (elementx.length > 0) {
              for (let i = 0; i < elementx.length; i++) {
                nodes = {};
                for (let j = 0; j < elementx[i].attributes.length; j++) {
                  const a = elementx[i].attributes[j].nodeName;
                  const b = elementx[i].attributes[j].nodeValue;
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
              const ele = select(complexContentWithElementPath, this.doc);
              for (let i = 0; i < ele.length; i++) {
                nodes = {};
                for (let j = 0; j < ele[i].attributes.length; j++) {
                  const a = ele[i].attributes[j].nodeName;
                  const b = ele[i].attributes[j].nodeValue;
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
      const typeElement = select(TypePath, this.doc);
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
              const b = typeElement[0].attributes[j].nodeValue;
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
    const select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    const attrTypePath = '/xs:schema/xs:element[@name=\'' + nodeValue + '\']/@type';
    const element = select(attrTypePath, this.doc);
    let attribute: any = {};
    if (element.length > 0) {
      const ele = select(attrTypePath, this.doc);
      let x;
      for (let i = 0; i < ele.length; i++) {
        const a = ele[i].nodeName;
        const b = ele[i].nodeValue;
        attribute = Object.assign(attribute, {[a]: b});

      }

      attribute.parent = nodeValue;
      attribute.grandFather = parentNode;
    }
    return this.getAttrsFromType(attribute);
  }

  getAttrsFromType(node) {
    const select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    const attrTypePath = '/xs:schema/xs:complexType[@name=\'' + node.type + '\']/xs:simpleContent/xs:extension/xs:attribute/@*';
    const element = select(attrTypePath, this.doc);
    const attrArr = [];
    let attribute: any = {};
    if (element.length > 0) {
      for (let i = 0; i < element.length; i++) {
        const a = element[i].nodeName;
        const b = element[i].nodeValue;
        attribute = Object.assign(attribute, {[a]: b});
      }
      attribute.parent = node.parent;
      attribute.grandFather = node.grandFather;
      const value: any = this.getAttrsValueFromType(attribute, node);
      if (value.length > 0) {
        attribute.values = value;
      }
      attrArr.push(attribute);
      return attrArr;
    }
  }

  getAttrsValueFromType(attr, node) {
    const select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    // tslint:disable-next-line: max-line-length
    const valueTypePath = '//xs:complexType[@name=\'' + node.type + '\']/xs:simpleContent/xs:extension/xs:attribute[@name=\'' + attr.name + '\']/xs:simpleType/xs:restriction/xs:enumeration';
    const element = select(valueTypePath, this.doc);
    const valueArr = [];
    if (element.length > 0) {
      for (let i = 0; i < element.length; i++) {
        let value = {};
        for (let j = 0; j < element[i].attributes.length; j++) {
          const a = element[i].attributes[j].nodeName;
          const b = element[i].attributes[j].nodeValue;
          value = Object.assign(value, {[a]: b});
        }
        valueArr.push(value);
      }
      return valueArr;
    }
  }

  getValFromDefault(node) {
    const select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    const attrTypePath = '/xs:schema/xs:element[@name=\'' + node.ref + '\']/@default';
    const ele = select(attrTypePath, this.doc);
    const valueArr: any = [];
    const value: any = {};
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
    const select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    const attrTypePath = '/xs:schema/xs:element[@name=\'' + nodeValue.ref + '\']/@type';
    const ele = select(attrTypePath, this.doc);
    const valueArr: any = [];
    const value: any = {};
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
    const select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    const attrTypePath = '/xs:schema/xs:element[@name=\'' + nodeValue + '\']/@type';
    const ele = select(attrTypePath, this.doc);
    let attribute: any = {};
    if (ele.length > 0) {
      for (let i = 0; i < ele.length; i++) {
        const a = ele[i].nodeName;
        const b = ele[i].nodeValue;
        attribute = Object.assign(attribute, {[a]: b});
      }
      attribute.parent = nodeValue;
      attribute.grandFather = parentNode;
    }
    return this.getTypeValue(attribute);
  }

  getTypeValue(node) {
    const select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    const extensionTypePath = '/xs:schema/xs:complexType[@name=\'' + node.type + '\']/xs:simpleContent/xs:extension/@*';
    let element = select(extensionTypePath, this.doc);
    let value: any = {};
    const valueArr: any = [];
    let b;
    if (element.length > 0) {
      if (element[0] && element[0].nodeValue === 'NotEmptyType') {
        let a = element[0].nodeName;
        const x = element[0].nodeValue;
        value = Object.assign(value, {[a]: x});
        const simpleTypePath = '/xs:schema/xs:simpleType[@name=\'' + value.base + '\']/xs:restriction/@*';
        element = select(simpleTypePath, this.doc);
        if (element.length > 0) {
          a = element[0].nodeName;
          b = element[0].nodeValue;
          value = Object.assign(value, {[a]: b});
          const minLengthPath = '/xs:schema/xs:simpleType[@name=\'' + x + '\']/xs:restriction/xs:minLength/@*';
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
    const select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let text: any = {};
    // const documentationPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:annotation/xs:documentation/@*';
    // const element = select(documentationPath, this.doc);
    // if (element.length > 0) {
    //   for (let i = 0; i < element.length; i++) {
    //     const a = element[i].nodeName;
    //     const b = element[i].nodeValue;
    //     text = Object.assign(text, {[a]: b});
    //   }
    // } else {
    //   const documentationPath1 = '/xs:schema/xs:element[@ref=\'' + node + '\']/xs:annotation/xs:documentation/@*';
    //   const element1 = select(documentationPath1, this.doc);
    //   for (let i = 0; i < element1.length; i++) {
    //     const a = element1[i].nodeName;
    //     const b = element1[i].nodeValue;
    //     text = Object.assign(text, {[a]: b});
    //   }
    // }
    const documentationPath2 = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:annotation/xs:documentation';
    const element2 = select(documentationPath2, this.doc);
    if (element2.length > 0) {
      text.doc = element2[0].innerHTML;
    }
    text.parent = node;
    return text;
  }

  checkDupProfileId (value, tag) {
    if (tag.name === 'profile_id' && this.selectedNode.ref == 'Profile') {
        this.getParentNode(this.selectedNode, this.nodes[0]);
        if (this.tempParentNode && this.tempParentNode.nodes.length > 0) {
            for (let i = 0; i < this.tempParentNode.nodes.length; i++) {
                if(this.tempParentNode.nodes[i].attributes) {
                    for (let j = 0; j < this.tempParentNode.nodes[i].attributes.length; j++) {
                        if (this.tempParentNode.nodes[i].uuid !== this.selectedNode.uuid && this.tempParentNode.nodes[i].attributes[j].id !== tag.id) {
                            if (this.tempParentNode.nodes[i].attributes[j].data === value) {
                                this.error = true;
                                this.errorName = {e: tag.name};
                                this.text = tag.name + ':' + this.uniqueName;
                                if (tag.data !== undefined) {
                                    for (const key in tag) {
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

  getParentNode(node, list) {
    if (node.parentId === list.uuid && list.parent === '#') {
        list.expanded = true;
        this.tempParentNode = list;
    } else {
        if (list.nodes) {
            for (let i = 0; i < list.nodes.length; i++) {
                if (node.parentId === list.nodes[i].uuid) {
                    list.nodes[i].expanded = true;
                    this.tempParentNode = list.nodes[i];
                } else {
                    this.getParentNode(node, list.nodes[i]);
                }
            }
        }
    }
  }

  expandParentNodesOfSelectedNode(node) {
    if (node.parent !== '#') {
      this.getParentNode(node, this.nodes[0]);
      if (this.tempParentNode && this.tempParentNode.parent !== '#') {
        this.expandParentNodesOfSelectedNode(this.tempParentNode);
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
    const select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    // tslint:disable-next-line: max-line-length
    const textAttrsPath = '/xs:schema/xs:element[@name=\'' + node.parent + '\']/xs:complexType/xs:attribute[@name=\'' + node.name + '\']/xs:annotation/xs:documentation';
    const element = select(textAttrsPath, this.doc);
    const text: any = {};
    if (element.length > 0) {
      text.doc = element;
      node.text = text;
    }
    if (element.length === 0) {
      // tslint:disable-next-line: max-line-length
      const textAttrsPath2 = '/xs:schema/xs:element[@name=\'' + node.parent + '\']/xs:complexType/xs:simpleContent/xs:extension/xs:attribute[@name=\'' + node.name + '\']/xs:annotation/xs:documentation';
      text.doc = select(textAttrsPath2, this.doc);
      node.text = text;
      if (text.length <= 0) {
        // tslint:disable-next-line: max-line-length
        const textAttrsPath1 = '/xs:schema/xs:element[@name=\'' + node.parent + '\']/xs:complexType/xs:complexContent/xs:extension/xs:attribute[@name=\'' + node.name + '\']/xs:annotation/xs:documentation';
        text.doc = select(textAttrsPath1, this.doc);
        node.text = text;
      }
    }
  }

  addTypeChildNode(node, parent, data) {
    let parentNode;
    const select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    const complexTypePath = '/xs:schema/xs:complexType[@name=\'' + node + '\']';
    const TypePath = '/xs:schema/xs:element[@name=\'' + node + '\']';
    let nodes: any = {};
    const childArr: any = [];
    const element = select(complexTypePath, this.doc);
    if (element.length > 0) {
      const sequencePath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence';
      const element1 = select(sequencePath, this.doc);
      if (element1.length > 0) {
        const childPath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence/xs:element';
        const childs = select(childPath, this.doc);
        if (childs.length > 0) {
          for (let i = 0; i < childs.length; i++) {
            nodes = {};
            for (let j = 0; j < childs[i].attributes.length; j++) {
              const a = childs[i].attributes[j].nodeName;
              const b = childs[i].attributes[j].nodeValue;
              nodes = Object.assign(nodes, {[a]: b});
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
        const seqChoicePath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence/xs:choice/xs:element';
        const getChildChoice = select(seqChoicePath, this.doc);
        if (getChildChoice.length > 0) {
          for (let i = 0; i < getChildChoice.length; i++) {
            nodes = {};
            for (let j = 0; j < getChildChoice[i].attributes.length; j++) {
              const a = getChildChoice[i].attributes[j].nodeName;
              const b = getChildChoice[i].attributes[j].nodeValue;
              nodes = Object.assign(nodes, {[a]: b});
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
        const seqChoiceSeqPath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence/xs:choice/xs:sequence/xs:element';
        const getChildChoiceSeq = select(seqChoiceSeqPath, this.doc);
        if (getChildChoiceSeq.length > 0) {
          for (let i = 0; i < getChildChoiceSeq.length; i++) {
            nodes = {};
            for (let j = 0; j < getChildChoiceSeq[i].attributes.length; j++) {
              const a = getChildChoiceSeq[i].attributes[j].nodeName;
              const b = getChildChoiceSeq[i].attributes[j].nodeValue;
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
      const choicePath = '//xs:complexType[@name=\'' + node + '\']/xs:choice';
      if ((select(choicePath, this.doc)).length) {
        const childPath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:choice/xs:element';
        const childs = select(childPath, this.doc);
        if (childs.length > 0) {
          for (let i = 0; i < childs.length; i++) {
            nodes = {};
            for (let j = 0; j < childs[i].attributes.length; j++) {
              const a = childs[i].attributes[j].nodeName;
              const b = childs[i].attributes[j].nodeValue;
              nodes = Object.assign(nodes, {[a]: b});
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
      const typeElement = select(TypePath, this.doc);
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
    const attrs = this.checkAttributes(child.ref);
    const text = this.checkText(child.ref);
    const value = this.getValues(child.ref);
    const attrsType: any = this.getAttrFromType(child.ref, child.parent);
    const valueType = this.getValueFromType(child.ref, child.parent);
    let val = this.getVal(child);
    if ((_.isEmpty(val)) && (_.isEmpty(value)) && (_.isEmpty(valueType))) {
      val = this.getValFromDefault(child);
    }
    child.recreateJson = true;
    child.order = index;
    child.children = [];
    nodeArr.expanded = true;
    child.uuid = this.counting;
    child.parentId = nodeArr.uuid;
    this.counting++;
    if (child.children && child.children.length > 0) {
      child.expanded = true;
    } else {
        child.expanded = false;
    }
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
    if (!(_.isEmpty(text))) {
      this.addText(text, nodeArr.children);
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
    this.autoExpand(nodeArr);
    this.printArraya(false);
    if (child) {
      this.selectedNode = child;
      this.getData(this.selectedNode);

      if (this.nodes.length > 0) {
        this.scrollTreeToGivenId(this.selectedNode.uuid);
      }
    }
    // this.changeValidConfigStatus(false);
  }

  autoAddChild(child) {
    if (this.autoAddCount === 0) {
      const getCh = this.checkChildNode(child, undefined);
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
            child[i].text = Object.assign({}, text);
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
        console.log(attrs[j].data);

        if(!attrs[j].data) {
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
    const select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    const enumerationPath = '//xs:element[@name=\'' + attrs.parent + '\']//xs:complexType/xs:simpleContent/xs:extension/xs:attribute[@name=\'' + attrs.name + '\']/xs:simpleType/xs:restriction/xs:enumeration';
    const valueArr = [];
    let valueJson = {};
    let value = select(enumerationPath, this.doc);
    if (value.length > 0) {
      for (let i = 0; i < value.length; i++) {
        valueJson = {};
        for (let j = 0; j < value[i].attributes.length; j++) {
          const a = value[i].attributes[j].nodeName;
          const b = value[i].attributes[j].nodeValue;
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
      const enumerationPath = '//xs:element[@name=\'' + attrs.parent + '\']//xs:complexType/xs:attribute[@name=\'' + attrs.name + '\']/xs:simpleType/xs:restriction/xs:enumeration';
      value = select(enumerationPath, this.doc);
      for (let i = 0; i < value.length; i++) {
        valueJson = {};
        for (let j = 0; j < value[i].attributes.length; j++) {
          const a = value[i].attributes[j].nodeName;
          const b = value[i].attributes[j].nodeValue;
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
    const select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    const extensionPath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:simpleContent/xs:extension/@*';
    let value: any = {};
    const valueArr: any = [];
    let b;
    let element = select(extensionPath, this.doc);
    if (element[0] && element[0].nodeValue !== 'NotEmptyType') {
      const a = element[0].nodeName;
      const x = element[0].nodeValue;
      value = Object.assign(value, {[a]: x});
      const defultPath = '//xs:element[@name=\'' + node + '\']/@*';
      const defAttr = select(defultPath, this.doc);
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
      const x = element[0].nodeValue;
      value = Object.assign(value, {[a]: x});
      const simpleTypePath = '//xs:simpleType[@name=\'' + value.base + '\']/xs:restriction/@*';
      element = select(simpleTypePath, this.doc);
      if (element.length > 0) {
        a = element[0].nodeName;
        b = element[0].nodeValue;
        value = Object.assign(value, {[a]: b});
        const minLengthPath = '//xs:simpleType[@name=\'' + x + '\']/xs:restriction/xs:minLength/@*';
        element = select(minLengthPath, this.doc);
        a = element[0].nodeName;
        b = element[0].nodeValue;
        value = Object.assign(value, {[a]: b});

      }
      const defultPath = '//xs:element[@name=\'' + node + '\']/@*';
      const defAttr = select(defultPath, this.doc);
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
      const extensionPath1 = '//xs:element[@name=\'' + node + '\']/xs:simpleType/xs:restriction/@*';
      element = select(extensionPath1, this.doc);
      if (element.length > 0) {
        let a = element[0].nodeName;
        const c = element[0].nodeValue;
        value = Object.assign(value, {[a]: c});
        const defultPath = '//xs:element[@name=\'' + node + '\']/@*';
        const defAttr = select(defultPath, this.doc);
        if (defAttr.length > 0) {
          for (let s = 0; s < defAttr.length; s++) {
            if (defAttr[s].nodeName === 'default') {
              value.default = defAttr[s].nodeValue;
              value.data = defAttr[s].nodeValue;
            }
          }
        }
        const minLengthPath = '//xs:element[@name=\'' + node + '\']/xs:simpleType/xs:restriction/xs:minLength/@*';
        element = select(minLengthPath, this.doc);
        const enumPath = '//xs:element[@name=\'' + node + '\']/xs:simpleType/xs:restriction/xs:enumeration/@*';
        const ele = select(enumPath, this.doc);
        if (element.length > 0) {
          a = element[0].nodeName;
          b = element[0].nodeValue;
          value = Object.assign(value, {[a]: b});
          const defultPath1 = '//xs:element[@name=\'' + node + '\']/@*';
          const defAttr = select(defultPath1, this.doc);
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
            let z: any = {};
            const x = ele[i].nodeName;
            const y = ele[i].nodeValue;
            z = Object.assign(z, {[x]: y});
            value.values.push(z);
          }
          const defultPath2 = '//xs:element[@name=\'' + node + '\']/@*';
          const defAttr = select(defultPath2, this.doc);

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
    const xmlEditorPath = '//xs:element[@name=\'' + node + '\']/xs:annotation/xs:appinfo/XmlEditor/@type';
    const attr = select(xmlEditorPath, this.doc);
    if (attr.length > 0) {
      value.base = attr[0].nodeValue;
    }
    if (_.isEmpty(value)) {
      let x;
      const valueFromXmlEditorPath = '//xs:element[@name=\'' + node + '\']/xs:annotation/xs:appinfo/XmlEditor';
      const attr1 = select(valueFromXmlEditorPath, this.doc);
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
    const keys = [];
    let count = 0;
    // tslint:disable-next-line: forin
    for (const key in child) {
      keys[count] = key;
      count++;
    }
    for (let i = 0; i < json.length; i++) {
      let count1 = 0;
      for (let k = 0; k < keys.length; k++) {
        const temp = json[i];
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
        const x = this.autoValidateRecursion(this.nodes[0].children[i]);
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
        const x = this.autoValidateRecursion(child.children[i]);
        if (x === false) {
          return x;
        }
      }
    }
  }

  // drag and drop check
  dragAndDropRules(arg: NzFormatBeforeDropEvent) {
    const dropNode = arg.node.origin;
    const dragNode = arg.dragNode.origin;
    this.dropCheck = false;
    if (dropNode.ref === dragNode.parent) {
      let count = 0;
      if (dragNode.maxOccurs === 'unbounded') {
        this.dropCheck =  true;
      } else if (dragNode.maxOccurs !== 'unbounded' && dragNode.maxOccurs !== undefined) {
        if (dropNode.children.length > 0) {
          for (let i = 0; i < dropNode.children.length; i++) {
            if (dragNode.ref === dropNode.children[i].ref) {
              count++;
            }
          }
          this.dropCheck = dragNode.maxOccurs !== count;
        } else if (dropNode.children.length === 0) {
          this.dropCheck =  true;
        }
      } else if (dragNode.maxOccurs === undefined) {
        if (dropNode.children.length > 0) {
          if (dropNode.children.length > 0) {
            this.dropCheck = (dragNode.ref !== dropNode.children[0].ref);
          }
        } else if (dropNode.children.length === 0) {
          this.dropCheck = true;
        }
      } else {
        this.dropCheck = false;
      }
    } else {
      this.dropCheck = false;
    }
  }

  // drop data
  dropData(arg: NzFormatBeforeDropEvent) {
    const from = arg.dragNode.origin;
    const x = JSON.parse(JSON.stringify(arg.dragNode.origin))
    const to = arg.node.origin;
    console.log(from, to, this.dropCheck);
    if (this.dropCheck) {
      console.log('------------>>>>>>');
      this.dropDataNode(x, to);
      this.removeNode(from);
    }
  }

  dropDataNode(from, to) {
    from.parentId = to.uuid;
    to.children.push(from);
    console.log(to.children);
    this.updateTree();
  }

  // to send data in details component
  getData(event) {
    console.log(event);

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

    if (this.preferences.expandOption === 'both') {

    }
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

  }

  // expand particular node
  expandNode(node) {
    node.expanded = true;
    if (node.children && node.children.length > 0) {
      for (let i = 0; i < node.children.length; i++) {
          node.children[i].expanded = true;
          if(node.children[i].children && node.children[i].children.length>0) {
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
          if (node.children[i].children && node.children[i].children.length>0) {
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
         // tree.treeModel.update();
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
                      for (const key in this.nodes[0].attributes[i]) {
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
                  for (const key in child.attributes[i]) {
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
    for (const key in node) {
      if (typeof (node[key]) === 'object') {
        this.copyItem = Object.assign({}, this.copyItem, {[key]: []});
        if ((key === 'attributes' || key === 'values') && node[key].length > 0) {
          for (let i = 0; i < node[key].length; i++) {
            let temp = {};
            for (const a in node[key][i]) {
              if (a === 'id') {
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
            const a = this.copyNodeRecursion(node[key][i]);
            this.copyItem[key].push(a);
          }
        } else if (key === 'text') {
          this.copyItem = Object.assign({}, this.copyItem, {[key]: node[key]});
        }
      } else {
        this.copyItem = Object.assign({}, this.copyItem, {[key]: node[key]});
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
    this.counting++;
    if (this.copyItem && !this.copyItem.order) {
      const a = this.checkChildNode(node, undefined);
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
    const copyData = JSON.parse(JSON.stringify(this.copyItem));
    if (node.ref === 'Profiles' && this.router.url.split('/')[2] === 'yade' && !this.cutData) {
      let tName;
      if (copyData && copyData.attributes) {
        for (let i = 0; i < copyData.attributes.length; i++) {
          if (copyData.attributes[i].name === 'profile_id' && copyData.attributes[i].data) {
            for (let j = 0; j < node.children.length; j++) {
              for (let k = 0; k < node.children[j].attributes.length; k++) {
                if (node.children[j].attributes[k].name === 'profile_id' && node.children[j].attributes[k].data) {
                  if (node.children[j].attributes[k].data.match(/-copy[0-9]+/i)) {
                    tName = node.children[j].attributes[k].data;
                  }
                  break;
                }
              }
            }
          }
          if (!tName && copyData.attributes[i].data) {
            tName = _.clone(copyData.attributes[i].data + '-copy1');
          } else if (tName) {

            tName = tName.split('-copy')[1];
            tName = parseInt(tName) || 0;

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
      this.oldName = Object.assign(this.oldName, {name: tab.name});
      const wt = $('#' + tab.id).width();
      setTimeout(() => {
        const dom = $('#rename-field');
        dom.width(wt);
        dom.focus();
        try {
          dom.select();
        } catch (e) {

        }
      }, 0);
    }
  }

  renameOnEnter($event, data) {
    const key = $event.keyCode || $event.which;
    if (key === 13) {
      delete data['rename'];
      if (data.name && data.name !== this.oldName.name) {
        this.renameFile(data);
      } else {
        data.name = _.clone(this.oldName.name);
        this.oldName = undefined;
      }
    }
  }

  renameFile(data) {
    this.coreService.post('xmleditor/rename', {
      jobschedulerId: this.schedulerIds.selected,
      objectType: this.objectType,
      id: data.id,
      name: data.name,
      schemaIdentifier: this.schemaIdentifier
    }).subscribe((res: any) => {
      this.oldName = undefined;
    }, (err) => {
      data.name = this.oldName.name;
      this.toasterService.pop('error', err.data.error.message);
    });
  }

  renameDone(data) {
    if (data.name && data.name !== this.oldName.name) {
      this.renameFile(data);
    } else {
      data.name = _.clone(this.oldName.name);
      this.oldName = undefined;
    }
    delete data['rename'];
  }

  cancelRename(data) {
    delete data['rename'];
    data.name = _.clone(this.oldName.name);
    this.oldName = undefined;
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
        console.log(err);
      }
    }
    if (!this.keyNodes || this.keyNodes.length === 0) {
      this.keyNodes = select(keyPath, this.doc);
    }
    if (this.keyNodes.length > 0) {
      for (let i = 0; i < this.keyNodes.length; i++) {
        const key = this.keyNodes[i].nodeName;
        const value = this.strReplace(this.keyNodes[i].nodeValue);
        keyattrs = Object.assign(keyattrs, {[key]: value});
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
      const key = keyRefNodes.attributes[i].nodeName;
      const value = this.strReplace(keyRefNodes.attributes[i].nodeValue);
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
    let k = false;
    let keyre = false;
    for (const key in nodes) {
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
      for (const key in showAllChild) {
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
        const x = event.replace(/<[^>]+>/gm);
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
          for (const key in tag) {
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
          for (const key in tag) {
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
          for (const key in tag) {
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
          for (const key in tag) {
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
          for (const key in tag) {
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
          for (const key in tag) {
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
          for (const key in tag) {
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
          for (const key in tag) {
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
          for (const key in tag) {
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
            for (const key in tag) {
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
            for (const key in tag) {
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
            for (const key in tag) {
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
            for (const key in tag) {
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
            for (const key in tag) {
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

  submitData(value, tag) {
    if (tag.type === 'xs:NMTOKEN') {
      if (/\s/.test(value)) {
        this.error = true;
        this.text = tag.name + ': ' + this.spaceNotAllowed;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (const key in tag) {
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
          for (const key in tag) {
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
          for (const key in tag) {
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
          for (const key in tag) {
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
          for (const key in tag) {
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
          for (const key in tag) {
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
          for (const key in tag) {
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
          for (const key in tag) {
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
          for (const key in tag) {
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
          for (const key in tag) {
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
          for (const key in tag) {
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
          for (const key in tag) {
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
          for (const key in tag) {
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
            for (const key in tag) {
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
            for (const key in tag) {
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
          for (const key in tag) {
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
          for (const key in tag) {
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
        for (const key in tag) {
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
        for (const key in tag) {
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
    let temp;
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

  // import xml model
  importXML() {
    if (localStorage.getItem('schemas')) {
      this.otherSchema = localStorage.getItem('schemas').split(',');
    }
    if (this.objectType === 'OTHER') {
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
            if (this.objectType === 'OTHER') {
              if (this.tabsArray.length === 0) {
                const _tab = _.clone({id: -1, name: 'edit1', schemaIdentifier: this.schemaIdentifier});
                this.tabsArray.push(_tab);
                this.coreService.post('xmleditor/read', {
                  jobschedulerId: this.schedulerIds.selected,
                  objectType: this.objectType,
                  id: _tab.id
                }).subscribe((res: any) => {
                  this.activeTab = this.tabsArray[0];
                  this.getXsdSchema();
                }, (err) => {
                  this.toasterService.pop('error', err.data.error.message);
                  this.isLoading = false;
                });
              } else {
                this.getXsdSchema();
              }
            } else {
              this.xmlToJsonService(res.uploadData);
            }
          } else {
            this.openXMLDialog(res.uploadData);
            this.importObj = {};
            // if (uploader.queue && uploader.queue.length > 0) {
            //     uploader.queue[0].remove();
            // }
          }
        }
      }
    }, () => {

    });
  }

  getXsdSchema() {
    const obj = {
      jobschedulerId: this.schedulerIds.selected,
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
      jobschedulerId: this.schedulerIds.selected,
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
      this.toasterService.pop('error', error.data.error.message);
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
      const keyCode = e.keyCode || e.which;
      if (keyCode == 9) {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
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
      const el = document.getElementById(evt);
      if (el !== null) {
        setTimeout(() => {
          el.style.cssText = 'padding:4px 8px; overflow:hidden;height:' + el.scrollHeight + 'px';
        }, 0);
      }
    }
  }

  // open new Confimation model
  newFile() {
    if (this.submitXsd && this.objectType !== 'OTHER') {
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
    } else if (!this.submitXsd && this.objectType !== 'OTHER') {
      this.copyItem = undefined;
      this.nodes = [];
      this.selectedNode = [];
      this.newConf();
    } else {
      if (this.objectType === 'OTHER') {
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

  othersSubmit(data) {
    this.isLoading = true;
    let obj: any = {
      jobschedulerId: this.schedulerIds.selected,
      objectType: 'OTHER'
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
      // this._activeTab.isVisible = false;
    },  (error) =>{
      this.isLoading = false;
      if (error.data && error.data.error) {
        this.toasterService.pop('error', error.data.error.message);
      }
    });
  }

  changeSchema(data) {
    this.isLoading = true;
    let obj;
    if (!this.importXSDFile) {
      obj = {
        jobschedulerId: this.schedulerIds.selected,
        objectType: 'OTHER',
        uri: this.selectedXsd,
        configuration: this._showXml()
      };
    } else {
      obj = {
        jobschedulerId: this.schedulerIds.selected,
        objectType: 'OTHER',
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
    },  () => {
      this.isLoading = false;
    });
  }

  createNewTab() {
    let _tab;
    if (this.tabsArray.length === 0) {
      _tab = _.clone({id: -1, name: 'edit1'});
    } else {
      let tempName;
      _tab = _.clone(this.tabsArray[this.tabsArray.length - 1]);
      _tab.id = Math.sign(_.clone(_tab.id - 1)) === 1 ? -1 : _.clone(_tab.id - 1);
      for (let i = 0; i < this.tabsArray.length; i++) {
        if (this.tabsArray[i].name) {
          const _arr = this.tabsArray[i].name.match(/[a-zA-Z]+/g);
          if (_arr && _arr.length > 0 && _arr[0] === 'edit') {
            if (!tempName) {
              tempName = this.tabsArray[i].name;
            }
            if (tempName && (parseInt(this.tabsArray[i].name.match(/\d+/g)[0]) > parseInt(tempName.match(/\d+/g)[0]))) {
              tempName = this.tabsArray[i].name;
            }
          }
        }
      }
      if (tempName) {
        _tab.name = _.clone('edit' + (parseInt(tempName.match(/\d+/g)[0]) + 1));
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

  getpos(id) {
    $('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover focus manual',
      html: true,
      delay: {'show': 500, 'hide': 200}
    });
    const a = '#' + id;
    $(a).tooltip('show');
  }

  // create Xml from Json
  showXml() {
    const xml = this._showXml();
    const modalRef = this.modalService.open(ShowModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.xml = xml;
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.objectType = this.objectType;
    modalRef.componentInstance.schemaIdentifier = this.schemaIdentifier;
    modalRef.componentInstance.activeTab = this.activeTab;
    modalRef.result.then((res: any) => {
      if (res.result.configurationJson) {
        const a = [];
        const arr = JSON.parse(res.result.configurationJson);
        a.push(arr);
        this.counting = arr.lastUuid;
        this.doc = new DOMParser().parseFromString(this.path, 'application/xml');
        this.nodes = a;
        this.submitXsd = true;
        const x = {state: {message: res.result.message}};
        this.XSDState = x.state;
        this.prevXML = '';
        this.selectedNode = this.nodes[0];
        this.getIndividualData(this.selectedNode, undefined);
        this.getData(this.selectedNode);
        // cb();
      }
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  jsonToXml() {
    const doc = document.implementation.createDocument('', '', null);
    const peopleElem = doc.createElement(this.nodes[0].ref);
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
    return peopleElem;
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
          const a = doc.createCDATASection(childrenNode.values[i].data);
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
    let link = './api/xmleditor/schema/download?jobschedulerId='
      + this.schedulerIds.selected + '&objectType=' + objType +
      '&accessToken=' + this.authService.accessTokenId;
    if (objType === 'OTHER') {
      link = link + '&schemaIdentifier=' + encodeURIComponent(schemaIdentifier);
      name = schemaIdentifier + '.xsd';
    }
    // saveAs(link, name);
    $('#tmpFrame').attr('src', link);
  }

  showXSD(objType, schemaIdentifier) {
    const windowProperties = ',scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no';
    let link = './api/xmleditor/schema/download?show=true&jobschedulerId='
      + this.schedulerIds.selected + '&objectType=' + objType + '&accessToken='
      + this.authService.accessTokenId;
    if (objType === 'OTHER') {
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
    const result1: any = convert.xml2json(data, {
      compact: true,
      spaces: 4,
      ignoreDeclaration: true,
      ignoreComment: true,
      alwaysChildren: true
    });
    let rootNode;
    let r_node;
    const x: any = JSON.parse(result1);
    for (const key in x) {
      rootNode = key;
    }
    const json = this.createTempJson(x, rootNode);
    for (const key in json) {
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
        temp = Object.assign(temp, {[rootNode]: editJson[rootNode][i]});
      }
    } else {
      for (let a in editJson[rootNode]) {
        if (a === '_text') {
          a = '_cdata';
        }
        if (a === '_attributes' || a === '_cdata') {
          if (temp[rootNode] === undefined) {
            temp = Object.assign(temp, {[rootNode]: {[a]: editJson[rootNode][a]}});
          } else {
            temp[rootNode] = Object.assign(temp[rootNode], {[a]: editJson[rootNode][a]});
          }
        } else {
          if (_.isArray(editJson[rootNode][a])) {
            for (let i = 0; i < editJson[rootNode][a].length; i++) {
              const x = a + '*' + i;
              if (temp[rootNode] === undefined) {
                temp = Object.assign(temp, {[rootNode]: {[x]: {}}});
              } else {
                temp[rootNode] = Object.assign(temp[rootNode], {[x]: {}});
              }
              for (const key in editJson[rootNode][a][i]) {
                this.createTempJsonRecursion(key, temp[rootNode][x], editJson[rootNode][a][i]);
              }
            }
          } else {
            if (temp[rootNode] === undefined) {
              temp = Object.assign(temp, {[rootNode]: {[a]: {}}});
              for (const key in editJson[rootNode][a]) {
                this.createTempJsonRecursion(key, temp[rootNode][a], editJson[rootNode][a]);
              }
            } else {
              temp[rootNode] = Object.assign(temp[rootNode], {[a]: {}});
              for (const key in editJson[rootNode][a]) {
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
      key = '_cdata';
    }
    if (key === '_attributes' || key === '_cdata') {
      tempArr = Object.assign(tempArr, {[key]: editJson[key]});
    } else {
      if (editJson && _.isArray(editJson[key])) {
        for (let i = 0; i < editJson[key].length; i++) {
          const x = key + '*' + i;
          tempArr = Object.assign(tempArr, {[x]: {}});
          if (editJson) {
            for (const as in editJson[key][i]) {
              this.createTempJsonRecursion(as, tempArr[x], editJson[key][i]);
            }
          }
        }
      } else {
        tempArr = Object.assign(tempArr, {[key]: {}});
        if (editJson) {
          for (const x in editJson[key]) {
            this.createTempJsonRecursion(x, tempArr[key], editJson[key]);
          }
        }
      }
    }
  }

  createJsonAccToXsd(xmljson, rootNode, mainjson) {
    mainjson.children = [];
    if (xmljson[rootNode] && xmljson[rootNode]._attributes !== undefined) {
      for (const key in xmljson[rootNode]._attributes) {
        if (mainjson && mainjson.attributes) {
          for (let i = 0; i < mainjson.attributes.length; i++) {
            if (key === mainjson.attributes[i].name) {
              const a = xmljson[rootNode]._attributes[key];
              mainjson.attributes[i] = Object.assign(mainjson.attributes[i], {data: a});
            }
          }
        }
      }
    }
    if (xmljson[rootNode] && xmljson[rootNode]._cdata !== undefined) {
      mainjson.values[0] = Object.assign(mainjson.values[0], {data: xmljson[rootNode]._cdata});
    }

    for (const key in xmljson[rootNode]) {
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
    const temp = {};
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
    for (const key in xmljson[rootNode]) {
      if (key === '_attributes') {
        mainjson = Object.assign(mainjson, {attributes: []});
        for (const x in xmljson[rootNode]._attributes) {
          const dat = xmljson[rootNode]._attributes[x];
          let temp1 = {};
          temp1 = Object.assign(temp1, {name: x, data: dat, parent: rootNode});
          mainjson.attributes.push(temp1);
        }
      }
    }
    for (const key in xmljson[rootNode]) {
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

      const x = f - a - b - c - 160;
      $('.documents').css({
        'max-height': x + 'px'
      });
    } else if ((d === null || d === 'null') && (e !== null || e !== 'null')) {
      const x = f - a - b - c - e - 160;
      $('.documents').css({
        'max-height': x + 'px'
      });
    } else if ((d !== null || d !== 'null') && (e == null || e === 'null')) {
      const x = f - a - b - c - d - 160;
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

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    this.coreService.tabs._configuration.state = this.objectType.toLowerCase();
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeunload($event) {
    return true;
  }

  private del() {
    if (this.objectType === 'OTHER' && this.activeTab.id < 0) {
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
    const obj: any = {
      jobschedulerId: this.schedulerIds.selected,
      objectType: this.objectType,
    };
    if (this.objectType === 'OTHER') {
      obj.id = this.activeTab.id;
    }
    this.coreService.post('xmleditor/delete', obj).subscribe((res: any) => {
      if (res.configuration) {
        if (!this.ok(res.configuration)) {
          const obj1: any = {
            jobschedulerId: this.schedulerIds.selected,
            objectType: this.objectType,
            configuration: res.configuration
          };
          if (this.objectType === 'OTHER') {
            obj1.schemaIdentifier = this.schemaIdentifier;
          }
          this.coreService.post('xmleditor/xml2json', obj1).subscribe((result: any) => {
            this.isLoading = true;
            const a = [];
            const arr = JSON.parse(result.configurationJson);
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
          if (this.objectType === 'OTHER') {
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
        if (this.objectType === 'OTHER') {
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
      this.toasterService.pop('error', error.data.error.message);
    });
  }

  private showError(error) {
    const iNode = {
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
    // if (!this.permission || !this.permission.JobschedulerMaster || !this.permission.JobschedulerMaster.administration.configurations.edit) {
    //     return;
    // }
    this._xml = this._showXml();
    if (!this._xml) {
      return;
    }
    let eRes;
    if (this.prevXML && this._xml) {
      eRes = this.compare(this.prevXML.toString(), this._xml.toString());
    }
    if (!eRes && this.objectType !== 'OTHER') {
      this.coreService.post('xmleditor/store', {
        jobschedulerId: this.schedulerIds.selected,
        objectType: this.objectType,
        configuration: this._xml,
        configurationJson: JSON.stringify({nodesCount: this.counting, node: this.nodes}),
      }).subscribe((res: any) => {
        this.isDeploy = false;
        this.XSDState = Object.assign({}, {message: res.message});
        this.XSDState.modified = res.modified;
        this.prevXML = this._xml;
      }, (error) => {
        this.toasterService.pop('error', error.data.error.message);
      });
    } else if (!eRes) {
      this.coreService.post('xmleditor/store', {
        jobschedulerId: this.schedulerIds.selected,
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
        this.toasterService.pop('error', error.data.error.message);
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
    console.log(node);

    if (!node.recreateJson) {
      const nod = {ref: node.parent};

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
    const d = data.replace(/\<\!\-\-((?!\-\-\>)[\s\S])*\-\-\>\s*/g, '');
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
    for (const key in node) {
      if (typeof (node[key]) === 'object') {
        tempa = Object.assign({}, tempa, {[key]: []});
        if ((key === 'attributes' || key === 'values') && node[key].length > 0) {
          for (let i = 0; i < node[key].length; i++) {
            let temp = {};
            for (const a in node[key][i]) {
              if (a === 'id') {
                temp = Object.assign(temp, {[a]: this.counting});
                this.counting++;
              } else {
                temp = Object.assign(temp, {[a]: node[key][i][a]});
              }
            }
            tempa[key].push(Object.assign({}, temp));
          }
        } else if (key === 'nodes' && node[key].length > 0) {
          for (let i = 0; i < node[key].length; i++) {
            const a = this.copyNodeRecursion(node[key][i]);
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
    this.counting++;
    if (node && node.children && node.children.length > 0) {
      node.children.forEach((cNode) => {
        this.changeUuId(cNode, node.uuid);
      });
    }
  }

  private getAllChild(list: any) {
    // tslint:disable-next-line: forin
    for (const child in list) {
      list[child].children = [];
      this.checkChildNode(list[child], list[child]);
    }
  }

  private xmlToJsonService(data) {
    const obj: any = {
      jobschedulerId: this.schedulerIds.selected,
      objectType: this.objectType,
      configuration: data
    };
    if (this.objectType === 'OTHER') {
      obj.schemaIdentifier = this.schemaIdentifier;
    }
    this.coreService.post('xmleditor/xml2json', obj).subscribe((res: any) => {
      this.validConfig = false;
      const a = [];
      const arr = JSON.parse(res.configurationJson);
      a.push(arr);
      this.counting = arr.lastUuid;
      this.doc = new DOMParser().parseFromString(this.path, 'application/xml');
      this.nodes = a;
      this.getIndividualData(this.nodes[0], undefined);
      this.selectedNode = this.nodes[0];
      this.isLoading = false;
      this.submitXsd = true;
      this.isDeploy = true;
      this.XSDState = {};
      this.prevXML = '';
      this.storeXML(undefined);
      if (this.objectType === 'OTHER') {
        // this.activeTab.schemaIdentifier = this.schemaIdentifier;
      }
    }, () => {
      this.importObj = {};
      // if (uploader.queue && uploader.queue.length > 0) {
      //     uploader.queue[0].remove();
      // }
      this.isLoading = false;
    });
  }

  private openXMLDialog(data) {
    this.editorOptions.readOnly = false;
    this.objectXml = {};
    this.objectXml.isXMLEditor = true;
    this.objectXml.xml = data;
    const modalRef = this.modalService.open(ShowModalComponent, {size: 'lg', backdrop: 'static'});
    modalRef.result.then(() => {

    }, () => {
      this.objectXml = {};
      this.toasterService.clear();
    });
  }

  private newConf() {
    const obj: any = {
      jobschedulerId: this.schedulerIds.selected,
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
        lNum = _.clone(num - parseInt(dom[0].children[0].innerText.split(' ')[0].split('↵')[0]) + 1);
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

  private validateSer() {
    this._xml = this._showXml();
    const obj: any = {
      jobschedulerId: this.schedulerIds.selected,
      objectType: this.objectType,
      configuration: this._xml
    };
    if (this.objectType === 'OTHER') {
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
      if (error.data && error.data.error) {
        this.toasterService.pop('error', error.data.error.message);
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
}
