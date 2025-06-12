import {Component, HostListener, inject, ViewChild} from '@angular/core';
import {NzFormatBeforeDropEvent, NzFormatEmitEvent, NzTreeNode} from 'ng-zorro-antd/tree';
import {TranslateService} from '@ngx-translate/core';
import {ToastrService} from 'ngx-toastr';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {Observable, of, Subscription, take} from 'rxjs';
import {Router} from '@angular/router';
import {ClipboardService} from 'ngx-clipboard';
import {NzMessageService} from 'ng-zorro-antd/message';
import {saveAs} from 'file-saver';
import xmlFormat from 'xml-formatter';
import {clone, isArray, isEmpty, isEqual, sortBy} from 'underscore';
import {NzContextMenuService, NzDropdownMenuComponent} from 'ng-zorro-antd/dropdown';
import {FileUploaderComponent} from "../../../components/file-uploader/file-uploader.component";
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {AuthService} from '../../../components/guard';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';

declare const require: any;
declare const $: any;

const xpath = require('xpath');
const convert = require('xml-js');

@Component({
  selector: 'app-show-child-modal',
  templateUrl: './show-child-dialog.html'
})
export class ShowChildModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA)
  doc: any;
  showAllChild: any;

  counter = 0;
  data: string;
  options: any = {};
  selectedNode: any;
  isExpandAll = false;

  constructor(public activeModal: NzModalRef, public coreService: CoreService) {
  }

  ngOnInit(): void {
    this.doc = this.modalData.doc;
    this.showAllChild = this.modalData.showAllChild;
    this.getText(this.showAllChild[0]);
    this.updateTree();
    let obj: any = this.showAllChild[0];
    obj.title = obj.ref || obj.name;
    for (let child in obj.children) {
      obj.children[child].children = [];
      obj.children[child].title = obj.children[child].ref || obj.children[child].name;
      this.checkChildNode(obj.children[child], obj.children[child]);
      this.recursiveGetAllChilds(obj.children[child].children);
    }
  }

  recursiveGetAllChilds(list: any): void {
    for (let child in list) {
      list[child].children = [];
      this.checkChildNode(list[child], list[child]);
      this.updateTree();
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

  getText(data): void {
    this.selectedNode = data;
    this.selectedNode.doc = this.checkText(data.ref || data.name);
  }

  checkText(node): any {
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

  expandAll(): void {
    this.isExpandAll = true;
    this.updateTree();
  }

  collapseAll(): void {
    this.isExpandAll = false;
    this.updateTree();
    for (let i = 0; i < this.showAllChild.length; i++) {
      this.showAllChild[i].expanded = false;
      if (this.showAllChild[i].children && this.showAllChild[i].children.length > 0) {
        this.expandCollapseRec(this.showAllChild[i].children, false);
      }
    }
  }

  search(q): void {
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
    this.updateTree();
  }

  updateTree(): void {
    this.showAllChild = [...this.showAllChild];
  }

  checkChildNode(showAllChild, data) {
    let node = showAllChild.ref || showAllChild.name;
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
              if (a === 'ref' || a === 'name') {
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
              if (a === 'ref' || a === 'name') {
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
              if (a === 'ref' || a === 'name') {
                nodes = Object.assign(nodes, {title: b});
              }
            }
            nodes.parent = node;
            if ((nodes.ref !== 'Minimum' && nodes.ref !== 'Maximum') || (nodes.name !== 'Minimum' && nodes.name !== 'Maximum')) {
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
              if (a === 'ref' || a === 'name') {
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
                if (a === 'ref' || a === 'name') {
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
                if (a === 'ref' || a === 'name') {
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
                  if (a === 'ref' || a === 'name') {
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
                  if (a === 'ref' || a === 'name') {
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
              if (a === 'ref' || a === 'name') {
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
              if (a === 'ref' || a === 'name') {
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
              if (a === 'ref' || a === 'name') {
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
              if (a === 'ref' || a === 'name') {
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

  private expandCollapseRec(node, flag): void {
    for (let i = 0; i < node.length; i++) {
      if (node[i].children && node[i].children.length > 0) {
        node[i].expanded = flag;
        this.expandCollapseRec(node[i].children, flag);
      }
    }
    this.updateTree();
  }
}

@Component({
  selector: 'app-show-modal',
  templateUrl: './show-dialog.html'
})
export class ShowModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA)
  xml: any;
  objectType: any;
  schemaIdentifier: any;
  schedulerId: any;
  activeTab: any;
  validation: any;
  prevErrLine: any;
  cmOptions: any = {
    indentWithTabs: true,
    lineNumbers: true,
    autoRefresh: true,
    lineWrapping: true,
    matchBrackets: true,
    foldGutter: true,
    tabSize: 4,
    scrollbarStyle: 'simple',
    viewportMargin: Infinity,
    highlightSelectionMatches: {showToken:/\w/, annotateScrollbar: true},
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    mode: 'xml',
  };
  obj: any = {xml: ''};
  @ViewChild('codeMirror', {static: true}) cm;

  constructor(public activeModal: NzModalRef, public coreService: CoreService, private message: NzMessageService,
              private toasterService: ToastrService, private clipboardService: ClipboardService, private translate: TranslateService,) {
  }

  ngOnInit(): void {
    this.xml = this.modalData.xml;
    this.objectType = this.modalData.objectType;
    this.schemaIdentifier = this.modalData.schemaIdentifier;
    this.schedulerId = this.modalData.schedulerId;
    this.activeTab = this.modalData.activeTab;
    this.validation = this.modalData.validation;
    this.cmOptions.tabSize = this.modalData.tabSize;
  }

  ngAfterViewInit(): void {
    if (this.validation && this.validation.validationError) {
      this.toasterService.error(this.validation.validationError.message, '');
    }
    setTimeout(() => {
      if (this.cm && this.cm.codeMirror) {
        const doc = this.cm.codeMirror.getDoc();
        const cursor = doc.getCursor(); // gets the line number in the cursor position
        doc.replaceRange(this.xml, cursor);
        this.cm.codeMirror.focus();
        doc.setCursor(cursor);
      }
    }, 300);
  }

  copyToClipboard(): void {
    this.coreService.showCopyMessage(this.message);
    this.clipboardService.copyFromContent(this.obj.xml);
  }

  validateXML(): void {
    const obj: any = {
      controllerId: this.schedulerId,
      objectType: this.objectType,
      configuration: this.obj.xml
    };
    if (this.objectType !== 'NOTIFICATION') {
      obj.schemaIdentifier = this.activeTab.schemaIdentifier;
    }
    this.coreService.post('xmleditor/validate', obj).subscribe({
      next: (res: any) => {
        if (res.validationError) {
          this.highlightLineNo(res.validationError.line);
          this.toasterService.error(res.validationError.message, '');
        } else {
          this.toasterService.clear();
        }
      }, error: (error) => {
        if (error.error) {
          this.toasterService.error(error.error.message, '');
        }
      }
    });
  }

  cancel(): void {
    this.activeModal.destroy();
  }

  execCommand(type): void {
    this.cm.codeMirror.execCommand(type);
    this.coreService.updateReplaceText();
  }

  submitXML(): void {
    let data = this.obj.xml;
    let obj: any = {
      configuration: data
    };
    if (this.objectType !== 'NOTIFICATION') {
      obj.controllerId = this.schedulerId;
      obj.objectType = this.objectType;
      obj.id = this.activeTab.id;
      obj.schemaIdentifier = this.schemaIdentifier;
      obj.name = this.activeTab.name;

    } else {
      if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
        this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
          obj.auditLog = {comment: translatedValue};
        });
      }
    }
    this.coreService.post(this.objectType !== 'NOTIFICATION' ? 'xmleditor/apply' : 'notification/store', obj).subscribe((res: any) => {
      if (res.validationError) {
        this.highlightLineNo(res.validationError.line);
        this.toasterService.error(res.ValidationError.message, '');
      } else {
        this.activeModal.close(res);
      }
    });
  }

  private highlightLineNo(num): void {
    let lNum = clone(num);
    let dom: any = document.getElementsByClassName('CodeMirror-code');
    if (dom && dom[0]) {
      if (num > dom[0].children.length) {
        $('.CodeMirror-scroll').animate({
          scrollTop: (17.8 * num)
        }, 500);
      }
      setTimeout(() => {
        dom = document.getElementsByClassName('CodeMirror-code');
        lNum = clone(num - parseInt(dom[0].children[0].innerText.split(' ')[0].split('↵')[0], 10) + 1);
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
          this.prevErrLine = clone(lNum);
        }
      }, 500);
    }
  }
}

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-dialog.html'
})
export class ConfirmationModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  save: any;
  self: any;
  assignXsd: any;
  delete: any;
  remove: any;
  deleteAll: any;
  objectType: any;
  activeTab: any;

  constructor(public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.save = this.modalData.save;
    this.self = this.modalData.self;
    this.assignXsd = this.modalData.assignXsd;
    this.delete = this.modalData.delete;
    this.remove = this.modalData.remove;
    this.deleteAll = this.modalData.deleteAll;
    this.objectType = this.modalData.objectType;
    this.activeTab = this.modalData.objectType;
  }

  confirmMessage(message): void {
    if (message === 'yes') {
      if (!this.delete && this.save) {
        this.save(this.self);
        this.activeModal.close('success');
      } else {
        this.activeModal.close('success');
      }
    } else {
      if (this.remove) {
        this.activeModal.destroy();
      } else {
        if (this.delete || this.deleteAll) {
          this.activeModal.destroy();
        } else {
          this.assignXsd(this.self);
          this.activeModal.close('success');
        }
      }
    }
  }
}

@Component({
  selector: 'app-xml',
  templateUrl: './xml-editor.component.html',
  styleUrls: ['./xml-editor.component.scss']
})
export class XmlEditorComponent {
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  isLoading = true;
  options: any = {};
  doc: any;
  nodes: any = [];
  showAllChild: any = [];
  counting = 0;
  autoAddCount = 0;
  copyItem: any = {};
  cutData = false;
  checkRule = true;
  choice = true;
  dropCheck: any = {status: false};
  selectedNode: any;
  selectedNodeDoc: any;
  selectedXsd = '';
  submitXsd = false;
  submitted;
  errorLocation: any;
  childNode: any = [];
  myContent: string;
  value: any = [];
  count = 1;
  dRefFlag: number;
  error = false;
  errorName;
  tempArr: any = [];
  text;
  validConfig = false;
  nonValidattribute: any = {};
  keyRefNodes;
  keyNodes;
  breadCrumbArray: any = [];
  refElement;
  objectType;
  schemaIdentifier;
  isExpandAll = false;
  isStore = false;
  isChange = false;
  path;
  prevXML;
  recreateJsonFlag;
  lastScrollId;
  mainXml;
  otherSchema: any = [];
  data: any;
  activeTab: any = {};
  extraInfo: any = {};
  tabsArray = [];
  previousName: string;
  oldName: string;
  tab: any;
  showSelectSchema: any;
  isTreeShow: boolean;
  reassignSchema: boolean;
  importXSDFile: boolean;
  sideView: any = {};
  uploadData: any;
  selectedTabIndex = 0;
  counter: number;
  requiredField: string;
  spaceNotAllowed: string;
  cannotAddBlankSpace: string;
  onlyPositiveNumbers: string;
  cannotNegative: string;
  colonNotAllowed: string;
  notValidUrl: string;
  uniqueName: string;
  onlyNumbers: string;
  menuNode: any = {};
  beforeDrop;
  jobResourcesTree = [];
  zones = [];

  subscription1: Subscription;

  @ViewChild('treeCtrl', {static: false}) treeCtrl: any;
  @ViewChild('menu', {static: true}) menu: NzDropdownMenuComponent;
  @ViewChild('scrollbar', {static: false}) componentRef?: any;

  constructor(
    public coreService: CoreService,
    private modal: NzModalService,
    private dataService: DataService,
    public translate: TranslateService,
    private message: NzMessageService,
    public toasterService: ToastrService,
    private nzContextMenuService: NzContextMenuService,
    private router: Router,
    private authService: AuthService
  ) {
    this.subscription1 = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  ngOnInit(): void {
    this.zones = this.coreService.getTimeZoneList();
    this.init();
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
    this.beforeDrop = (arg: NzFormatBeforeDropEvent): Observable<boolean> => {
      return of(false);
    };
  }

  private init(): void {
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.sideView = this.coreService.getSideView();
    if (!this.sideView.xml) {
      this.sideView.xml = {width: 500, show: true};
    }
    if (this.sideView.xml && !this.sideView.xml.show) {
      this.hidePanel();
    }
    if (!this.schedulerIds.selected) {
      this.isLoading = false;
      return;
    }
    const url = this.router.url.split('/')[2];
    this.objectType = url.toUpperCase();
    if (this.objectType === 'FILE_TRANSFER') {
      this.objectType = 'YADE';
    }
    if (url === 'notification') {
      this.selectedXsd = 'systemMonitorNotification';
    }
    if (this.objectType === 'NOTIFICATION') {
      if (this.selectedXsd !== '') {
        this.readXML();
      }
    } else {
      this.othersXSD();
    }

  }

  @HostListener('window:beforeunload', ['$event'])
  beforeunload(): void {
    if (this.nodes && this.nodes.length > 0 && !this.isStore) {
      this.isChange = true;
      this.storeXML();
    }
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.coreService.setSideView(this.sideView);
    if (this.activeTab) {
      if (this.objectType === 'YADE') {
        this.coreService.xmlEditorPreferences.fileTransferActiveTab = this.activeTab.name;
      } else if (this.objectType === 'OTHER') {
        this.coreService.xmlEditorPreferences.otherActiveTab = this.activeTab.name;
      }
    }
    if (this.nodes && this.nodes.length > 0 && !this.isStore) {
      this.isChange = true;
      this.storeXML();
    }
    this.coreService.tabs._configuration.state = (this.objectType === 'YADE' || !this.objectType) ? 'file_transfer' : this.objectType.toLowerCase();
    $('.scroll-y').remove();
  }

  contextMenu(node: any, evt): void {
    if (this.menu) {
      this.menuNode = node;
      setTimeout(() => {
        this.nzContextMenuService.create(evt, this.menu);
      }, 0);
    }
    this.checkChildNode(node.origin, null);
    this.checkRules(node.origin, this.copyItem);
    this.checkChoice(node.origin);
    this.checkOrder(node.origin);
  }

  onChangeJobResource($event, node): void {
    this.isTreeShow = false;
    node.data = $event;
    if (this.objectType === 'NOTIFICATION') {
      this.extraInfo.released = false;
    } else {
      this.checkJobResource($event);
      this.extraInfo.sync = false;
      this.autoValidate();
    }
    this.isChange = true;
  }

  onBlur(): void {
    this.isTreeShow = false;
  }

  onTreeSearch(term,node) {
    node.data = term;
  }

  private checkJobResource(name): void {
    this.extraInfo.isExist = false;
    const obj: any = {
      path: name,
      objectType: 'JOBRESOURCE',
    };
    this.coreService.post('inventory/read/configuration', obj).subscribe((res: any) => {
      this.extraInfo.isExist = true;
      this.extraInfo.deployed = res.deployed;
    });
  }

  deleteAllConf(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ConfirmationModalComponent,
      nzData: {
        deleteAll: true,
        objectType: this.objectType
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        let obj = {
          controllerId: this.schedulerIds.selected,
          objectTypes: [this.objectType],
        };
        this.coreService.post('xmleditor/remove/all', obj).subscribe(() => {
          this.tabsArray = [];
          this.nodes = [];
          this.selectedNode = {};
          this.submitXsd = false;
          this.isLoading = false;
          this.schemaIdentifier = '';
          this.createNewTab();
        });
      }
    });
  }

  openFolder(data: NzTreeNode | NzFormatEmitEvent): void {
    if (data instanceof NzTreeNode) {
      if (!data.isExpanded) {
        if (data.origin.children.length > 20) {
          data.origin['loading'] = true;
          setTimeout(() => {
            delete data.origin['loading'];
          }, 100);
        }
      }
      setTimeout(() => {
        data.isExpanded = !data.isExpanded;
      }, 0);
    } else {
      const node = data.node;
      if (node) {
        node.isExpanded = !node.isExpanded;
      }
    }
  }

  //delete config
  deleteConf(tab = null): void {
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Notification',
        operation: 'Delete',
        name: ''
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzData: {
          comments,
        },
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          let obj = {
            auditLog: {
              comment: result.comment,
              timeSpent: result.timeSpent,
              ticketLink: result.ticketLink
            }
          };

          this.deleteNotification(obj);
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmationModalComponent,
        nzData: {
          delete: true,
          objectType: this.objectType,
          activeTab: (this.objectType !== 'NOTIFICATION') ? tab : undefined
        },
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          if (this.objectType === 'NOTIFICATION') {
            this.deleteNotification({});
          } else {
            this.del(tab);
          }
        }
      });
    }
  }

  removeConf(): void {
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Notification',
        operation: 'Remove',
        name: ''
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzData: {
          comments,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          let obj: any = {
            release: true,
            auditLog: {
              comment: result.comment,
              timeSpent: result.timeSpent,
              ticketLink: result.ticketLink
            }
          };

          this.deleteNotification(obj);
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmationModalComponent,
        nzData: {
          remove: true,
          objectType: this.objectType
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          if (this.objectType === 'NOTIFICATION') {
            let obj: any = {
              release: true
            };

            this.deleteNotification(obj);
          } else {
            this.del(null);
          }
        }
      });
    }
  }

  releaseXML(): void {
    this.autoValidate();
    this.mainXml = this._showXml();
    if (!this.mainXml) {
      return;
    }
    if (isEmpty(this.nonValidattribute)) {
      let obj: any = {
        configuration: this.mainXml,
        configurationJson: JSON.stringify({nodesCount: this.counting, node: this.nodes}),
      }
      if (this.preferences.auditLog) {
        let comments = {
          radio: 'predefined',
          type: 'Notification',
          operation: 'Remove',
          name: ''
        };
        const modal = this.modal.create({
          nzTitle: undefined,
          nzContent: CommentModalComponent,
          nzData: {
            comments,
          },
          nzFooter: null,
          nzAutofocus: null,
          nzClosable: false,
          nzMaskClosable: false
        });
        modal.afterClose.subscribe(result => {
          if (result) {
            obj.auditLog = {
              comment: result.comment,
              timeSpent: result.timeSpent,
              ticketLink: result.ticketLink

            };

            this.releaseNotification(obj);
          }
        });
      } else {
        this.releaseNotification(obj);
      }
    } else {
      this.gotoErrorLocation();
      this.popToast(this.nonValidattribute);
      if (this.nonValidattribute.name) {
        this.validateAttr('', this.nonValidattribute);
      }
    }
  }

  private releaseNotification(obj): void {
    this.coreService.post('notification/release', obj).subscribe({
      next: (res: any) => {
        if (res.validationError) {
          this.showError(res.validationError);
        } else {
          this.prevXML = this.mainXml;
          this.extraInfo = {
            released: res.released,
            configurationDate: res.configurationDate,
            state: res.state,
            hasReleases: res.hasReleases
          };
          this.validConfig = true;
        }
      }, error: (error) => {
        if (error && error.error) {
          this.showErrorToast(error.error.message, '');
        }
      }
    });
  }

  deployXML(isCheck = false): void {
    this.autoValidate();
    this.mainXml = this._showXml();
    if (!this.mainXml) {
      return;
    }
    const obj: any = {};
    for (const i in this.nodes[0].children) {
      if (this.nodes[0].children[i].ref === 'JobResource') {
        for (const j in this.nodes[0].children[i].attributes) {
          if (this.nodes[0].children[i].attributes[j].name === 'name') {
            obj.name = this.nodes[0].children[i].attributes[j].data;
          } else if (this.nodes[0].children[i].attributes[j].name === 'variable') {
            obj.variable = this.nodes[0].children[i].attributes[j].data;
          } else if (this.nodes[0].children[i].attributes[j].name === 'environment_variable') {
            obj.env = this.nodes[0].children[i].attributes[j].data;
          }
        }
        break;
      }
    }
    if (obj.name) {
      this.getSingleObject(obj, isCheck);
    }

  }

  private getSingleObject(obj, isCheck = false): void {
        if (!isCheck) {
          this.storeAndDeployJobResource(obj);
        }
  }

  private storeAndDeployJobResource( obj): void {

    const request = {
      auditLog: {}
    };
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
        request.auditLog = {comment: translatedValue};
      });
    }
      this.coreService.post('xmleditor/deploy', {
        controllerIds: [this.schedulerIds.selected],
        auditLog: request.auditLog,
        objectType: 'YADE',
        id: this.data.id,
        configuration: this.mainXml,
        configurationJson: JSON.stringify({nodesCount: this.counting, node: this.nodes}),
      }).subscribe({
        next: (res: any) => {
          if (res.validationError) {
            this.showError(res.validationError);
          } else {
            this.extraInfo.sync = true;
            this.extraInfo.deployed = res.released
          }
        }, error: (error) => {
          if (error && error.error) {
            this.showErrorToast(error.error.message, '');
          }
        }
      });
  }

  private compareJobResource(configuration, obj): void {
    let flag = true;
    if (!configuration.arguments) {
      flag = false;
    } else if (!configuration.arguments[obj.variable]) {
      flag = false;
    }
    if (flag) {
      if (!configuration.env) {
        flag = false;
      } else if (!configuration.env[obj.env]) {
        flag = false;
      }
    }
    if (flag) {
      if (!isEqual(JSON.stringify(configuration.arguments[obj.variable]), JSON.stringify("toFile( '" + this._showXml(this.nodes, true) + "', '*.xml' )"))) {
        flag = false;
      }
    }
    this.extraInfo.sync = flag;
  }

  checkXML(): void {
    this.deployXML(true);
  }

  tabChange(tab, index): void {
    this.selectedTabIndex = index;
    if (this.activeTab.id > -1 && this.activeTab.id !== tab.id) {
      this.isLoading = true;
      this.isChange = true;
      this.storeXML(this.activeTab, true);
    }
    if (this.activeTab.id !== tab.id) {
      if (this.tabsArray.length > 0) {
        this.breadCrumbArray = [];
        this.activeTab = tab;
        this.readOthersXSD(this.activeTab.id);
        this.validConfig = false;
      }
    }
  }

  changeTab(data): void {
    this.activeTab = data;
    this.readOthersXSD(data.id);
    this.validConfig = false;
  }

  hideDocumentation(data): void {
    data.show = !data.show;
  }

  othersXSD(): void {
    this.submitXsd = false;
    this.coreService.post('xmleditor/read', {
      controllerId: this.schedulerIds.selected,
      objectType: this.objectType
    }).subscribe({
      next: (res: any) => {
        this.data = res
        if (res.schemas) {
          this.otherSchema = res.schemas;
          if (this.objectType === 'OTHER') {
            localStorage.setItem('schemas', this.otherSchema);
          } else {
            localStorage.setItem('yadeSchema', this.otherSchema);
          }
        }
        if (this.objectType === 'OTHER') {
          this.extraInfo = {
            released: res.released,
            state: res.state,
            hasReleases: res.hasReleases,
            configurationDate: res.configurationDate
          };
        }
        if (!res.configurations) {
          this.tabsArray = [];
          this.isLoading = false;
          this.newFile();
        } else {
          this.tabsArray = clone(res.configurations);
          if ((this.objectType == 'YADE' && this.coreService.xmlEditorPreferences.fileTransferActiveTab) || (this.objectType == 'OTHER' && this.coreService.xmlEditorPreferences.otherActiveTab)) {
            if (this.tabsArray.length > 1) {
              for (const i in this.tabsArray) {
                if ((this.objectType == 'YADE' && this.tabsArray[i].name == this.coreService.xmlEditorPreferences.fileTransferActiveTab)
                  || (this.objectType == 'OTHER' && this.tabsArray[i].name == this.coreService.xmlEditorPreferences.otherActiveTab)) {
                  this.selectedTabIndex = parseInt(i, 10);
                  break;
                }
              }
            }
          }
          this.activeTab = this.tabsArray[this.selectedTabIndex];
          if (this.activeTab) {
            this.readOthersXSD(this.activeTab.id);
          }
        }
      }, error: (error) => {
        this.isLoading = false;
        this.tabsArray = [];
        this.error = true;
        if (error && error.error) {
          this.showErrorToast(error.error.message, '');
        }
      }
    });
  }

  readOthersXSD(id): void {
    this.nodes = [];
    this.selectedNode = {};
    this.coreService.post('xmleditor/read', {
      controllerId: this.schedulerIds.selected,
      objectType: this.objectType,
      id
    }).subscribe({
      next: (res: any) => {
        this.data = res
        if (res.validation && res.validation.validated) {
          this.validConfig = true;
        } else {
          if (res.configuration && res.configuration.validation && res.configuration.validation.validated) {
            this.validConfig = true;
          }
        }
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
          if (!this.ok(res.configuration)) {
            this.doc = new DOMParser().parseFromString(res.schema, 'application/xml');
            this.path = res.schema;
            this.schemaIdentifier = res.schemaIdentifier;
            this.submitXsd = true;
            this.prevXML = this.removeComment(res.configuration);
            if (res.configurationJson) {
              let _tempArrToExpand = [];
              let a;
              try {
                a = JSON.parse(res.configurationJson);
              } catch (error) {
                this.submitXsd = false;
              }
              if (!res.recreateJson) {
                this.counting = clone(a.nodesCount);
                this.nodes = a.node;
              } else {
                this.counting = a.lastUuid;
                this.nodes = [a];
              }
              this.handleNodeToExpandAtOnce(this.nodes, _tempArrToExpand);
              this.selectedNode = this.nodes[0];
              this.getIndividualData(this.selectedNode, undefined);
              this.selectedNodeDoc = this.checkText(this.nodes[0]);
              this.extraInfo = {
                released: res.released,
                state: res.state,
                hasReleases: res.hasReleases,
                configurationDate: res.configurationDate,
                modified: res.modified ? res.modified : ''
              };
              this.printArraya(false);
              if (_tempArrToExpand && _tempArrToExpand.length > 0) {
                setTimeout(() => {
                  for (const i in _tempArrToExpand) {
                    _tempArrToExpand[i].expanded = true;
                    delete _tempArrToExpand[i].loading;
                  }
                  this.nodes = [...this.nodes];
                }, 0);
              }
            } else {
              this.nodes = [];
              this.loadTree(res.schema, true);
            }
            if (this.nodes.length > 0 && this.nodes[0].children && this.nodes[0].children.length > 0) {
              for (const i in this.nodes[0].children) {
                if (this.nodes[0].children[i].ref === 'JobResource') {
                  for (const j in this.nodes[0].children[i].attributes) {
                    if (this.nodes[0].children[i].attributes[j].name === 'name') {
                      this.getJobResourceTree(this.nodes[0].children[i].attributes[j]);
                      break;
                    }
                  }
                  break;
                }
              }
            }
          } else {
            this.openXMLDialog(res.configuration);
          }
        }
        this.isLoading = false;
      }, error: (err) => {
        this.submitXsd = false;
        this.isLoading = false;
        this.extraInfo = {};
        this.error = true;
        if (err.data && err.data.error) {
          this.showErrorToast(err.data.error.message, '');
        }
      }
    });
  }

  cancelReassignSchema(): void {
    this.reassignSchema = false;
    this.submitXsd = true;
    this.showSelectSchema = false;
  }

  expandAll(): void {
    this.isExpandAll = true;
    this.updateTree();
  }

  collapseAll(): void {
    this.isExpandAll = false;
    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i].expanded = false;
      if (this.nodes[i].children && this.nodes[i].children.length > 0) {
        this.expandCollapseRec(this.nodes[i].children, false);
      }
    }
  }

  updateTree(): void {
    this.nodes = [...this.nodes];
  }

  // change selected xsd value
  changeXSD(value): void {
    this.selectedXsd = value;
  }

  // submit xsd to open
  submit(): void {
    if (this.selectedXsd !== '') {
      sessionStorage['$SOS$XSD'] = this.selectedXsd;
      this.readXML();
      this.submitXsd = true;
    }
  }

  readXML(): void {
    this.selectedXsd = this.selectedXsd.toUpperCase();
    let obj = {
      objectType: this.objectType
    };
    this.coreService.post('notification', obj).subscribe({
      next: (res: any) => {
        this.isChange = false;
        if (res.validation && res.validation.validated) {
          this.validConfig = true;
        } else {
          if (res.configuration && res.configuration.validation && res.configuration.validation.validated) {
            this.validConfig = true;
          }
        }
        this.schemaIdentifier = res.schemaIdentifier;
        this.path = res.schema;
        this.submitXsd = true;
        this.extraInfo = {
          released: res.released,
          state: res.state,
          hasReleases: res.hasReleases,
          configurationDate: res.configurationDate,
          modified: res.configuration ? res.configuration.modified : ''
        };
        this.doc = new DOMParser().parseFromString(this.path, 'application/xml');
        if (res.configurationJson) {
          this.prevXML = this.removeComment(res.configuration);
          let jsonArray;
          try {
            jsonArray = JSON.parse(res.configurationJson);
          } catch (e) {
            this.isLoading = false;
            this.submitXsd = false;
          }
          this.recreateJsonFlag = res.recreateJson;
          if (!res.recreateJson && jsonArray.node) {
            this.nodes = jsonArray.node;
            this.counting = clone(jsonArray.nodesCount);
          } else {
            let a = [jsonArray];
            this.counting = jsonArray.lastUuid;
            this.nodes = a;
          }
          if (this.nodes) {
            this.isLoading = false;
            this.selectedNode = this.nodes[0];
            this.getIndividualData(this.selectedNode, undefined);
            this.selectedNodeDoc = this.checkText(this.nodes[0]);
            this.printArraya(false);
          }

        } else if (res.configuration) {
          if (!this.ok(res.configuration)) {
            this.nodes = [];
            this.isLoading = true;
            this.submitXsd = true;
            this.prevXML = this.removeComment(res.configuration);
            this.loadTree(this.path, true);
            setTimeout(() => {
              this.createJsonFromXml(res.configuration);
            }, 600);
          } else {
            this.submitXsd = false;
            this.isLoading = false;
            // openXMLDialog(res.configuration);
          }
        } else {
          this.submitXsd = false;
          this.isLoading = false;
        }
      }, error: () => {
        this.isLoading = false;
        this.submitXsd = false;
      }
    });
  }

  checkOrder(node): void {
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
      if (node) {
        this.getNodeRulesData(node);
      }
    }, 10);
  }

  private getJobResourceTree(node): void {
    if (this.jobResourcesTree.length === 0) {
      this.coreService.post('tree', {
        types: ['JOBRESOURCE'],
        forInventory: true
      }).subscribe((res) => {
        this.jobResourcesTree = this.coreService.prepareTree(res, true);
        this.matchJobResourceList(node);
      });
    } else {
      this.matchJobResourceList(node);
    }
  }

  private matchJobResourceList(node): void {
    if (node) {
      if (this.objectType === 'NOTIFICATION') {
        if (typeof node.data === 'string') {
          let val = node.data;
          node.data = [val];
        } else if (!node.data || !isArray(node.data)) {
          node.data = [];
        }
      }
      if (node.data) {
        if (typeof node.data == 'string') {
          // this.checkJobResource(node.data);
          this.extraInfo.isExist = true;
          this.extraInfo.deployed = this.data.released;
        }
      }
    }
  }

  getIndividualData(node, scroll) {
    let flag = false;
    let attrs = this.checkAttributes(node.ref || node.name);
    if (attrs && attrs.length > 0) {
      if (node.attributes && node.attributes.length > 0) {
        for (let i = 0; i < attrs.length; i++) {
          for (let j = 0; j < node.attributes.length; j++) {
            this.checkAttrsValue(attrs[i]);
            let vals = (attrs[i].values && attrs[i].values.length > 0) ? this.coreService.clone(attrs[i].values) : '';
            if (attrs[i].name === node.attributes[j].name) {
              attrs[i] = Object.assign(attrs[i], node.attributes[j]);
              if (vals && attrs[i].values && attrs[i].values.length === 0) {
                attrs[i].values = vals;
              }
              if (attrs[i].type === 'xs:list') {
                if (!attrs[i].data && attrs[i].default) {
                  attrs[i].data = attrs[i].default;
                }
                if (attrs[i].data && typeof attrs[i].data === 'string') {
                  attrs[i].data1 = attrs[i].data.split(' ');
                }
              }
            }
          }
          if (((attrs[i].name === 'name' && attrs[i].parent === 'JobResource') || attrs[i].name === 'job_resources') && !flag) {
            flag = true;
            this.getJobResourceTree(attrs[i]);
          }
        }
      }
    }
    let value = this.getValues(node.ref || node.name);
    if (node.values && node.values.length > 0) {
      for (let i = 0; i < value.length; i++) {
        for (let j = 0; j < node.values.length; j++) {
          if (value[i].parent === node.values[j].parent) {
            value[i] = Object.assign(value[i], node.values[j]);
          }
        }
      }
    }
    let attrsType = this.getAttrFromType(node.ref || node.name, node.parent);
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
    let valueType = this.getValueFromType(node.ref || node.name, node.parent);

    if (valueType && valueType.length > 0) {
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
    if ((isEmpty(val)) && (isEmpty(value)) && (isEmpty(valueType))) {
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
    if (!(isEmpty(attrs))) {
      this.attachAttrs(attrs, node);
    }
    if (!(isEmpty(val))) {
      node.values = clone([]);
      for (let j = 0; j < val.length; j++) {
        val[j].uuid = this.counting;
        val[j].key = this.counting;
        this.counting++;
        if (val[j].base === 'password') {
          val[j].pShow = false;
        }
        if (node && node.values) {
          node.values = clone([]);
          node.values.push(val[j]);
        }
      }
    }
    if (!(isEmpty(value))) {
      node.values = [];
      for (let j = 0; j < value.length; j++) {
        value[j].uuid = this.counting;
        value[j].key = this.counting;
        this.counting++;
        if (value[j].base === 'password') {
          value[j].pShow = false;
        }
        if (node && node.values) {
          node.values = clone([]);
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
          node.values = clone([]);
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

  scrollTreeToGivenId(id): void {
    if (this.lastScrollId !== id) {
      this.lastScrollId = clone(id);
    }
    this.selectedNode.expanded = true;
    this.getParentToExpand(this.selectedNode);
    this.updateTree();
    setTimeout(() => {
      this.scrollTree(this.selectedNode.uuid);
    }, 0);
  }

  getParentToExpand(node): void {
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

  ok(conf): boolean {
    let dom_parser = new DOMParser();
    let dom_document = dom_parser.parseFromString(conf, 'text/xml');
    try {
      if (dom_document.documentElement.getElementsByTagName('parsererror').length > 0
        || dom_document.documentElement.nodeName === 'parsererror') {
        if (dom_document.documentElement.getElementsByTagName('parsererror').length > 0) {
          let a: any = dom_document.documentElement.getElementsByTagName('parsererror')[0];
          this.showErrorToast(a.innerText, 'Invalid xml ');
        } else {
          this.showErrorToast(dom_document.documentElement.firstChild.nodeValue, 'Invalid xml ');
        }
        return true;
      } else {
        return false;
      }
    } catch (e) {
      let a: any = dom_document.documentElement.getElementsByTagName('parsererror')[0];
      this.showErrorToast(e, 'Invalid xml ' + a.innerText);
      return true;
    }
  }

  loadTree(xml, check): void {
    this.doc = new DOMParser().parseFromString(xml, 'application/xml');
    this.getRootNode(this.doc, check);
    this.xpath();
    this.AddKeyReferencing();
    this.getData(this.nodes[0]);
    this.isLoading = !!check;
  }

  reassignSchemaFunc(): void {
    this.reassignSchema = true;
    this.submitXsd = false;
    this.showSelectSchema = true;
    this.selectedXsd = (this.schemaIdentifier) ? this.schemaIdentifier : this.selectedXsd;
    this.otherSchema = localStorage.getItem('schemas').split(',');
  }

  getRootNode(doc, check): void {
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
    attrs = this.checkAttributes(temp.ref || temp.name);
    if (attrs.length > 0) {
      temp.attributes = [];
      for (let i = 0; i < attrs.length; i++) {
        attrs[i].id = this.counting;
        this.counting++;
        temp.attributes.push(attrs[i]);
      }
    }

    if (!check) {
      child = this.checkChildNode(temp, undefined);

      if (child && child.length > 0) {
        for (let i = 0; i < child.length; i++) {
          if (child[i].minOccurs == undefined) {
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
    let attrs = select(attrsPath, this.doc);
    if (attrs.length > 0) {
      for (let i = 0; i < attrs.length; i++) {
        attribute = {};
        let x = void 0;
        for (let j = 0; j < attrs[i].attributes.length; j++) {
          let a = attrs[i].attributes[j].nodeName;
          let b = attrs[i].attributes[j].nodeValue;
          attribute = Object.assign(attribute, this._defineProperty({}, a, b));
          let valueFromXmlEditorPath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:attribute[@name=\''
            + b + '\']/xs:annotation/xs:appinfo/XmlEditor';
          let attr1 = select(valueFromXmlEditorPath, this.doc);
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

  checkChildNode(_nodes: any, data: any): any[] {
    let node = _nodes.ref || _nodes.name;
    const parentFragment = _nodes.parent;
    let parentNode: string;
    if (!data) {
      this.childNode = [];
    }
    const select = xpath.useNamespaces({ 'xs': 'http://www.w3.org/2001/XMLSchema' });
    const complexTypePath = `//xs:element[@name='${node}']/xs:complexType`;

 
    const TypePath =
      `/xs:schema/xs:element[@name='${node}' and @type]` +
      ` | ` +

      `//xs:element[@name='${parentFragment}']/xs:complexType//xs:element` +
      `[@name='${node}' and @type]`;
    ;

  let nodes: any = {};
  let childArr: any[] = [];

    const element = select(complexTypePath, this.doc);
    if (element.length > 0) {
      const sequencePath = `//xs:element[@name='${node}']/xs:complexType/xs:sequence`;
      const choicePath = `//xs:element[@name='${node}']/xs:complexType/xs:choice`;
      const childFromBasePath = `//xs:element[@name='${node}']/xs:complexType/xs:complexContent/xs:extension/@base`;
      const complexContentWithElementPath =
        `//xs:element[@name='${node}']/xs:complexType/xs:complexContent/xs:extension/xs:sequence/xs:element`;

      const childs = select(childFromBasePath, this.doc);
      const element1 = select(sequencePath, this.doc);

      if (element1.length > 0) {

        const dPath =
          `//xs:element[@name='${node}']/xs:complexType/xs:sequence/xs:choice/xs:element`;
        const dElement = select(dPath, this.doc);
        if (dElement.length > 0) {
          for (let i = 0; i < dElement.length; i++) {
            nodes = {};
            for (let j = 0; j < dElement[i].attributes.length; j++) {
              const a = dElement[i].attributes[j].nodeName;
              const b = dElement[i].attributes[j].nodeValue;
              nodes = Object.assign(nodes, this._defineProperty({}, a, b));
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
        const cPath = `//xs:element[@name='${node}']/xs:complexType/xs:sequence/xs:element`;
        const cElement = select(cPath, this.doc);

        if (cElement.length > 0) {
          for (let i = 0; i < cElement.length; i++) {
            nodes = {};
            for (let j = 0; j < cElement[i].attributes.length; j++) {
              const a = cElement[i].attributes[j].nodeName;
              const b = cElement[i].attributes[j].nodeValue;
              nodes = Object.assign(nodes, this._defineProperty({}, a, b));
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

        const ePath =
          `//xs:element[@name='${node}']/xs:complexType/xs:sequence/xs:choice/xs:sequence/xs:element`;
        const eElement = select(ePath, this.doc);
        if (eElement.length > 0) {
          for (let i = 0; i < eElement.length; i++) {
            nodes = {};
            for (let j = 0; j < eElement[i].attributes.length; j++) {
              const a = eElement[i].attributes[j].nodeName;
              const b = eElement[i].attributes[j].nodeValue;
              nodes = Object.assign(nodes, this._defineProperty({}, a, b));
            }
            nodes.parent = node;
            if (
              (nodes.ref !== 'Minimum' && nodes.ref !== 'Maximum') ||
              (nodes.name !== 'Minimum' && nodes.name !== 'Maximum')
            ) {
              nodes.choice = node;
            }
            if (nodes.minOccurs && !nodes.maxOccurs) {
              // no-op
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

      if (select(choicePath, this.doc).length > 0) {
        const childPath = `//xs:element[@name='${node}']/xs:complexType/xs:choice/xs:element`;
        const childs1 = select(childPath, this.doc);
        if (childs1.length > 0) {
          for (let i = 0; i < childs1.length; i++) {
            nodes = {};
            for (let j = 0; j < childs1[i].attributes.length; j++) {
              const a = childs1[i].attributes[j].nodeName;
              const b = childs1[i].attributes[j].nodeValue;
              nodes = Object.assign(nodes, this._defineProperty({}, a, b));
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
          const childPath2 =
            `//xs:element[@name='${node}']/xs:complexType/xs:choice/xs:sequence/xs:element`;
          const child12 = select(childPath2, this.doc);
          if (child12.length > 0) {
            for (let i = 0; i < child12.length; i++) {
              nodes = {};
              for (let j = 0; j < child12[i].attributes.length; j++) {
                const a = child12[i].attributes[j].nodeName;
                const b = child12[i].attributes[j].nodeValue;
                nodes = Object.assign(nodes, this._defineProperty({}, a, b));
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
          const childrenPath =
            `//xs:complexType[@name='${childs[0].nodeValue}']/xs:sequence/xs:element`;
          const sElement = select(childrenPath, this.doc);
          if (sElement.length > 0) {
            for (let i = 0; i < sElement.length; i++) {
              nodes = {};
              for (let j = 0; j < sElement[i].attributes.length; j++) {
                const a = sElement[i].attributes[j].nodeName;
                const b = sElement[i].attributes[j].nodeValue;
                nodes = Object.assign(nodes, this._defineProperty({}, a, b));
              }
              nodes.parent = node;
              childArr.push(nodes);
              if (data) {
                data.children = childArr;
              } else {
                this.childNode = childArr;
              }
            }
          } else if (select(complexContentWithElementPath, this.doc).length > 0) {
            const childrenPath1 =
              `//xs:complexType[@name='${childs[0].nodeValue}']/xs:choice/xs:element`;
            const elementx = select(childrenPath1, this.doc);
            if (elementx.length > 0) {
              for (let i = 0; i < elementx.length; i++) {
                nodes = {};
                for (let j = 0; j < elementx[i].attributes.length; j++) {
                  const a = elementx[i].attributes[j].nodeName;
                  const b = elementx[i].attributes[j].nodeValue;
                  nodes = Object.assign(nodes, this._defineProperty({}, a, b));
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
                  nodes = Object.assign(nodes, this._defineProperty({}, a, b));
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
    } else if (select(TypePath, this.doc).length > 0) {
      parentNode = node;
      const typeElement = select(TypePath, this.doc);
      if (typeElement.length > 0 && typeElement[0].attributes.length > 0) {
        for (let i = 0; i < typeElement[0].attributes.length; i++) {
          const attrName = typeElement[0].attributes[i].nodeName;
          const attrValue = typeElement[0].attributes[i].nodeValue;
          if (attrName === 'type') {
            this.addTypeChildNode(attrValue, parentNode, data);
          }
          if (attrValue === 'xs:boolean') {
            _nodes = Object.assign(_nodes, { values: [] });
            let temp: any = {};
            for (let j = 0; j < typeElement[0].attributes.length; j++) {
              const a = typeElement[0].attributes[j].nodeName;
              const b = typeElement[0].attributes[j].nodeValue;
              if (a === 'type') {
                temp.base = b;
              } else if (a === 'default') {
                temp.data = b;
              }
              temp[a] = b;
            }
            temp.parent = node;
            _nodes.values.push(temp);
          }
        }
      }
    }

    return this.childNode;
  }

  getAttrFromType(nodeValue, parentNode): any {
    let select = xpath.useNamespaces({
      'xs': 'http://www.w3.org/2001/XMLSchema'
    });
    let attrTypePath = '/xs:schema/xs:element[@name=\'' + nodeValue + '\']/@type';
    let element = select(attrTypePath, this.doc);
    let attribute: any = {};
    if (element.length > 0) {
      let ele = select(attrTypePath, this.doc);
      for (let i = 0; i < ele.length; i++) {
        let a = ele[i].nodeName;
        let b = ele[i].nodeValue;
        attribute = Object.assign(attribute, this._defineProperty({}, a, b));
      }
      attribute.parent = nodeValue;
      attribute.grandFather = parentNode;
    }
    return this.getAttrsFromType(attribute);
  }

  getAttrsFromType(node): Array<any> {
    let select = xpath.useNamespaces({
      'xs': 'http://www.w3.org/2001/XMLSchema'
    });
    let attrTypePath = '/xs:schema/xs:complexType[@name=\'' + node.type + '\']/xs:simpleContent/xs:extension/xs:attribute/@*';
    let element = select(attrTypePath, this.doc);
    let attrArr = [];
    let attribute: any = {};
    if (element.length > 0) {
      for (let i = 0; i < element.length; i++) {
        let a = element[i].nodeName;
        let b = element[i].nodeValue;
        attribute = Object.assign(attribute, this._defineProperty({}, a, b));
      }
      attribute.parent = node.parent;
      attribute.grandFather = node.grandFather;
      let value: any = this.getAttrsValueFromType(attribute, node);
      if (value.length > 0) {
        attribute.values = value;
      }
      attrArr.push(attribute);
    }
    return attrArr;
  }

  getAttrsValueFromType(attr, node): Array<any> {
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
          value = Object.assign(value, this._defineProperty({}, a, b));
        }
        valueArr.push(value);
      }
    }
    return valueArr;
  }

  getValFromDefault(node): Array<any> {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let attrTypePath = '/xs:schema/xs:element[@name=\'' + (node.ref || node.name) + '\']/@default';
    let ele = select(attrTypePath, this.doc);
    let valueArr: any = [];
    let value: any = {};
    for (let i = 0; i < ele.length; i++) {
      value.base = 'xs:string';
      value.parent = node.ref;
      value.grandFather = node.parent;
      value.data = ele[i].nodeValue;
    }
    if (!(isEmpty(value))) {
      valueArr.push(value);
    }
    return valueArr;
  }

  getVal(nodeValue): any {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let attrTypePath = '/xs:schema/xs:element[@name=\'' + (nodeValue.ref || nodeValue.name) + '\']/@type';
    let ele = select(attrTypePath, this.doc);
    let valueArr: any = [];
    let value: any = {};
    for (let i = 0; i < ele.length; i++) {
      if (ele[i].nodeValue === 'xs:string' || ele[i].nodeValue === 'xs:long' || ele[i].nodeValue === 'xs:positiveInteger') {
        value.base = ele[i].nodeValue;
        value.parent = nodeValue.ref;
        value.grandFather = nodeValue.parent;
      }
      if (!(isEmpty(value))) {
        valueArr.push(value);
      }
    }
    return valueArr;
  }

  getValueFromType(nodeValue, parentNode): any {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let attrTypePath = '/xs:schema/xs:element[@name=\'' + nodeValue + '\']/@type';
    let ele = select(attrTypePath, this.doc);
    let attribute: any = {};
    if (ele.length > 0) {
      for (let i = 0; i < ele.length; i++) {
        let a = ele[i].nodeName;
        let b = ele[i].nodeValue;
        attribute = Object.assign(attribute, this._defineProperty({}, a, b));
      }
      attribute.parent = nodeValue;
      attribute.grandFather = parentNode;
    }
    return this.getTypeValue(attribute);
  }

  getTypeValue(node): Array<any> {
    if (node.type !== 'xs:boolean') {
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

        if (!(isEmpty(value))) {
          valueArr.push(value);
        }
      }
      return valueArr;
    } else {
      let _value;
      let _valueArr = [];
      _value = Object.assign(node, {
        base: node.type
      });
      if (!isEmpty(_value)) {
        _valueArr.push(_value);
      }
      return _valueArr;
    }
  }

  checkDupProfileId(value, tag) {
    if (tag.name === 'profile_id' && this.selectedNode.ref === 'Profile') {
      let tempParentNode: any = this.getParentNode(this.selectedNode);
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
    return parent ? parent.origin : parent;
  }

  async expandParentNodesOfSelectedNode(node) {
    if (node && node.parent !== '#') {
      let tempParentNode: any = await this.getParentNode(node);
      if (tempParentNode && tempParentNode.parent !== '#') {
        await this.expandParentNodesOfSelectedNode(tempParentNode);
      }
    }
  }

  getFirstNotEmptyAttribute(attrs): string {
    let str = '';
    if (attrs && attrs.length > 0) {
      for (let i = 0; i < attrs.length; i++) {
        if (attrs[i].data) {
          str = attrs[i].name + '=' + attrs[i].data;
          break;
        }
      }
    }
    return str;
  }

  checkAttrsText(node, select): void {
    let textAttrsPath = '/xs:schema/xs:element[@name=\'' + node.parent + '\']/xs:complexType/xs:attribute[@name=\''
      + node.name + '\']/xs:annotation/xs:documentation';
    let element = select(textAttrsPath, this.doc);
    let text: any = {};
    if (element.length > 0) {
      text.doc = element;
      node.text = text;
    } else if (element.length === 0) {
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
              nodes = Object.assign(nodes, this._defineProperty({}, a, b));
            }
            nodes.parent = parent;
            nodes.choice1 = parent;
            let flag = false;
            for (let k = 0; k < childArr.length; k++) {
              if (childArr[k].ref === nodes.ref || childArr[k].name === nodes.name) {
                flag = true;
                childArr[k] = Object.assign(childArr[k], nodes);
                break;
              }
            }
            if (!flag) {
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
    this.menuNode = {};
    let attrs = this.checkAttributes(child.ref || child.name);
    let value = this.getValues(child.ref || child.name);
    let attrsType: any = this.getAttrFromType(child.ref || child.name, child.parent);
    let valueType = this.getValueFromType(child.ref|| child.name, child.parent);
    let val = this.getVal(child);
    if ((isEmpty(val)) && (isEmpty(value)) && (isEmpty(valueType))) {
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
    if (!(isEmpty(attrs))) {
      this.attachAttrs(attrs, child);
    }
    if (child.ref === 'JobResource') {
      this.getJobResourceTree(null);
    }
    nodeArr.children.push(child);
    nodeArr.children = sortBy(nodeArr.children, 'order');
    if (check) {
      if ((nodeArr && (nodeArr.ref !== 'SystemMonitorNotification' || (nodeArr.ref === 'SystemMonitorNotification' && child.ref !== 'Timer')))) {
        this.autoAddChild(child);
      }
    }
    if (!isEmpty(val)) {
      this.attachValue(val, nodeArr.children);
    }
    if (!(isEmpty(value))) {
      this.attachValue(value, nodeArr.children);
    }
    if (valueType !== undefined) {
      this.attachValue(valueType, nodeArr.children);
    }
    if (attrsType !== undefined) {
      this.attachTypeAttrs(attrsType, nodeArr.children);
    }

    // this.autoExpand(nodeArr);
    this.printArraya(false);
    if (child) {
      this.getData(child);
      if (this.nodes.length > 0) {
        this.scrollTreeToGivenId(this.selectedNode.uuid);
      }
    }
    this.extraInfo.released = false;
    this.isChange = true;
    this.validateSer(false)
  }

  autoAddChild(child) {
      let getCh = this.checkChildNode(child, undefined);
      if (getCh) {
        for (let i = 0; i < getCh.length; i++) {
          if (getCh[i].minOccurs === undefined || getCh[i].minOccurs === 1 || getCh[i].minOccurs === '1') {
            if (!getCh[i].choice) {
              getCh[i].children = [];
              this.addChild(getCh[i], child, true, i);
            }
          }
        }
      }
      this.getData(child);
      this.printArraya(false);
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
          this.printArraya(false);
        } else {
          for (let j = 0; j < attrs.length; j++) {
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
        if ((value[0] && value[0].parent === child[i].ref ||value[0] && value[0].parent === child[i].name) && value[0].grandFather === child[i].parent) {
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
          if (value && value[0] && (value[0].parent === child[i].ref || value[0].parent === child[i].name)) {
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

      if (value.length === 0) {
        let list = '//xs:element[@name=\'' + attrs.parent + '\']//xs:complexType/xs:attribute[@name=\'' + attrs.name + '\']/xs:simpleType/xs:list';
        list = select(list, this.doc);
        if (list && list.length > 0) {
          attrs.type = 'xs:list';
          attrs.values = [];
          let enumerationPath = '//xs:element[@name=\'' + attrs.parent + '\']//xs:complexType/xs:attribute[@name=\'' + attrs.name + '\']/xs:simpleType/xs:list/xs:simpleType/xs:restriction/xs:enumeration';
          let value = select(enumerationPath, this.doc);
          for (let i = 0; i < value.length; i++) {
            if (value[i].attributes.length > 0) {
              attrs.values.push(value[i].attributes[0].nodeValue);
            }
          }
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
      let a = element[0].nodeName;
      let x = element[0].nodeValue;
      value = Object.assign(value, this._defineProperty({}, a, x));
      let simpleTypePath = '//xs:simpleType[@name=\'' + value.base + '\']/xs:restriction/@*';
      element = select(simpleTypePath, this.doc);

      if (element.length > 0) {
        a = element[0].nodeName;
        b = element[0].nodeValue;
        value = Object.assign(value, this._defineProperty({}, a, b));
        const minLengthPath = '//xs:simpleType[@name=\'' + x + '\']/xs:restriction/xs:minLength/@*';
        element = select(minLengthPath, this.doc);
        a = element[0].nodeName;
        b = element[0].nodeValue;
        value = Object.assign(value, this._defineProperty({}, a, b));
      }

      let _defultPath = '//xs:element[@name=\'' + node + '\']/@*';

      let _defAttr = select(_defultPath, this.doc);

      if (_defAttr.length > 0) {
        for (let s = 0; s < _defAttr.length; s++) {
          if (_defAttr[s].nodeName === 'default') {
            value.default = _defAttr[s].nodeValue;
            value.data = _defAttr[s].nodeValue;
          }
        }
      }

      value.parent = node;
    } else {
      let extensionPath1 = '//xs:element[@name=\'' + node + '\']/xs:simpleType/xs:restriction/@*';
      element = select(extensionPath1, this.doc);

      if (element.length > 0) {
        let a = element[0].nodeName;
        let c = element[0].nodeValue;
        value = Object.assign(value, this._defineProperty({}, a, c));

        let _defultPath2 = '//xs:element[@name=\'' + node + '\']/@*';

        let _defAttr2 = select(_defultPath2, this.doc);

        if (_defAttr2.length > 0) {
          for (let s = 0; s < _defAttr2.length; s++) {
            if (_defAttr2[s].nodeName === 'default') {
              value.default = _defAttr2[s].nodeValue;
              value.data = _defAttr2[s].nodeValue;
            }
          }
        }

        let _minLengthPath = '//xs:element[@name=\'' + node + '\']/xs:simpleType/xs:restriction/xs:minLength/@*';

        element = select(_minLengthPath, this.doc);
        let enumPath = '//xs:element[@name=\'' + node + '\']/xs:simpleType/xs:restriction/xs:enumeration/@*';
        let ele = select(enumPath, this.doc);

        if (element.length > 0) {
          a = element[0].nodeName;
          b = element[0].nodeValue;
          value = Object.assign(value, this._defineProperty({}, a, b));
          let defultPath1 = '//xs:element[@name=\'' + node + '\']/@*';

          let _defAttr3 = select(defultPath1, this.doc);

          if (_defAttr3.length > 0) {
            for (let s = 0; s < _defAttr3.length; s++) {
              if (_defAttr3[s].nodeName === 'default') {
                value.default = _defAttr3[s].nodeValue;
                value.data = _defAttr3[s].nodeValue;
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
            z = Object.assign(z, this._defineProperty({}, x, y));
            value.values.push(z);
          }

          let defultPath2 = '//xs:element[@name=\'' + node + '\']/@*';

          let _defAttr4 = select(defultPath2, this.doc);

          if (_defAttr4.length > 0) {
            for (let s = 0; s < _defAttr4.length; s++) {
              if (_defAttr4[s].nodeName === 'default') {
                value.default = _defAttr4[s].nodeValue;
                value.data = _defAttr4[s].nodeValue;
              }
            }
          }
        }
      }

      if (!isEmpty(value)) {
        value.parent = node;
      }
    }
    const xmlEditorPath = '//xs:element[@name=\'' + node + '\']/xs:annotation/xs:appinfo/XmlEditor/@type';
    const attr = select(xmlEditorPath, this.doc);
    if (attr.length > 0) {
      value.base = attr[0].nodeValue;
    }

    if (isEmpty(value)) {
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
          }
        }
      }
    }

    if (!isEmpty(value)) {
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

  getCustomCss(node: any, parentNode: any): string {
    const id = node.ref || node.name;
    let count = 0;
    const children = parentNode.children || [];
    for (const child of children) {
      const childId = child.ref || child.name;
      if (childId === id) {
        count++;
      }
    }

    if (this.choice) {
      if (node.maxOccurs === 'unbounded') {
        return '';
      }

      if (node.maxOccurs !== 'unbounded' && node.maxOccurs !== undefined) {
        const max = Number(node.maxOccurs);
        if (count >= max) {
          return 'disabled disable-link';
        }
      }
      else if (node.maxOccurs === undefined) {
        if (count >= 1) {
          return 'disabled disable-link';
        }
      }

      return node.choice ? 'disabled disable-link' : '';
    }

    if (node.maxOccurs === 'unbounded') {
      return '';
    }

    if (node.maxOccurs !== 'unbounded' && node.maxOccurs !== undefined) {
      const max = Number(node.maxOccurs);
      if (count >= max) {
        return 'disabled disable-link';
      }
    }
    else if (node.maxOccurs === undefined) {
      if (count >= 1) {
        return 'disabled disable-link';
      }
    }

    return '';
  }


  printArray(rootchildrensattrArr): void {
    this.nodes.push(rootchildrensattrArr);
    this.printArraya(true);
  }

  printArraya(flag): void {
    if (!flag) {
      this.autoAddCount = 0;
    }
    this.xpath();
    this.AddKeyReferencing();
    this.nodes = [...this.nodes];
  }

  // autoValidate
  autoValidate(): void {
    this.validConfig = true;
    if (this.nodes[0] && this.nodes[0].attributes && this.nodes[0].attributes.length > 0) {
      for (let i = 0; i < this.nodes[0].attributes.length; i++) {
        if (this.nodes[0].attributes[i].use === 'required') {
          if (this.nodes[0].attributes[i].data === undefined) {
            this.nonValidattribute = this.nodes[0].attributes[i];
            this.errorLocation = this.nodes[0];
            this.validConfig = false;
          }
        }
      }
    }
    if (this.nodes[0] && this.nodes[0].values && this.nodes[0].values.length > 0) {
      if (this.nodes[0].values[0].data === undefined) {
        this.nonValidattribute = this.nodes[0].values[0];
        this.errorLocation = this.nodes[0];
        this.validConfig = false;
      }
    }
    if (this.nodes[0] && this.nodes[0].children && this.nodes[0].children.length > 0) {
      for (let i = 0; i < this.nodes[0].children.length; i++) {
        this.autoValidateRecursion(this.nodes[0].children[i]);
      }
    }
    this.nonValidattribute = {};

  }

  autoValidateRecursion(child): any {
    if (child && child.attributes && child.attributes.length > 0) {
      for (let i = 0; i < child.attributes.length; i++) {
        if (child.attributes[i].use === 'required') {
          if (child.attributes[i].data === undefined || child.attributes[i].data === null) {
            this.nonValidattribute = child.attributes[i];
            this.errorLocation = child;
            this.validConfig = false;
            return false;
          }
        }
      }
    }
    if (child && child.values && child.values.length > 0) {
      if (child.values[0].data === undefined || child.values[0].data === null) {
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
    return;
  }

  dragEnter(arg: NzFormatEmitEvent): void {
    arg.event.preventDefault();
    arg.event.stopPropagation();
    const dropNode: any = arg.node.origin;
    const dragNode: any = arg.dragNode.origin;
    this.dropCheck = {status: false};
    if (dragNode && dropNode) {
      if (dropNode.ref === dragNode.parent) {
        let count = 0;
        if (dragNode.maxOccurs === 'unbounded') {
          this.dropCheck = {status: true, dropNode: dropNode.ref};
        } else if (dragNode.maxOccurs !== 'unbounded' && dragNode.maxOccurs !== undefined) {
          if (dropNode.children.length > 0) {
            for (let i = 0; i < dropNode.children.length; i++) {
              if (dragNode['ref'] === dropNode.children[i].ref) {
                count++;
              }
            }
            this.dropCheck = {status: dragNode['maxOccurs'] != count, dropNode: dropNode.ref};
          } else if (dropNode.children.length === 0) {
            this.dropCheck = {status: true, dropNode: dropNode.ref};
          }
        } else if (dragNode['maxOccurs'] === undefined) {
          if (dropNode.children.length > 0) {
            let flag = true;
            for (let i = 0; i < dropNode.children.length; i++) {
              if (dragNode['ref'] === dropNode.children[i].ref) {
                flag = false;
                break;
              }
            }
            this.dropCheck = {status: flag, dropNode: dropNode.ref};
          } else if (dropNode.children.length === 0) {
            this.dropCheck = {status: true, dropNode: dropNode.ref};
          }
        }
      }
    }
  }

  // drop data
  dropData(arg: NzFormatEmitEvent): void {
    const dragNode = arg.dragNode.origin;
    const dropNode = arg.node.origin;
    if (this.dropCheck.status && this.dropCheck.dropNode === dropNode['ref']) {
      this.removeNode(this.coreService.clone(dragNode));
      dragNode['parentId'] = dropNode['uuid'];
      dropNode.children.push(dragNode);
    }
    arg.event.preventDefault();
    arg.event.stopPropagation();
  }

  private removeDocs(): void {
    if (this.selectedNode) {
      delete this.selectedNode.preview;
      if (this.selectedNode.attributes) {
        for (const i in this.selectedNode.attributes) {
          delete this.selectedNode.attributes[i].text;
          delete this.selectedNode.attributes[i].data1;
        }
      }
    }
  }

  selectNode(node): void {
    this.getData(node.origin);
    this.getIndividualData(node.origin, undefined);
    if (this.selectedNode && this.selectedNode.ref === 'JobResource') {
      const arr = [];
      const arr2 = [];
      for (const i in this.selectedNode.attributes) {
        if (this.selectedNode.attributes[i].name === 'name') {
          arr.push(this.selectedNode.attributes[i]);
        } else if (this.selectedNode.attributes[i].name === 'environment_variable') {
          arr2.push(this.selectedNode.attributes[i]);
        } else {
          arr.push(this.selectedNode.attributes[i]);
        }
      }
      this.selectedNode.attributes = arr.concat(arr2);
    }
    this.changeLastUUid(node.origin);
    if (this.preferences.expandOption === 'both') {
      node.isExpanded = !node.isExpanded;
    }
  }

  // to send data in details component
  getData(event): void {
    this.removeDocs();
    if (event && event.keyref && event.attributes) {
      for (let i = 0; i < event.attributes.length; i++) {
        if (event.attributes[i].name === event.keyref) {
          this.getDataAttr(event.attributes[i].refer);
          break;
        }
      }
    }
    this.selectedNode = event;
    this.selectedNodeDoc = this.checkText(event);
    this.breadCrumbArray = [];
    if (event) {
      this.createBreadCrumb(event);
      this.breadCrumbArray.reverse();
    }
  }

  checkText(node: any): any {
    const select = xpath.useNamespaces({ 'xs': 'http://www.w3.org/2001/XMLSchema' });
    let text: any = {};
    const nameOrRef = node.ref || node.name;

    let docs = select(
      `/xs:schema/xs:element[@name='${nameOrRef}']/xs:annotation/xs:documentation`,
      this.doc
    );

    if (docs.length === 0) {
      docs = select(
        `//xs:element[@name='${nameOrRef}']/xs:annotation/xs:documentation`,
        this.doc
      );
    }

    if (docs.length === 0 && node.type) {
      docs = select(
        `//xs:complexType[@name='${node.type}']/xs:annotation/xs:documentation`,
        this.doc
      );
    }

    if (docs.length === 0 && node.type) {
      const firstChildAttr = select(
        `//xs:complexType[@name='${node.type}']//xs:sequence/xs:element[1]/@ref
       | //xs:complexType[@name='${node.type}']//xs:sequence/xs:element[1]/@name`,
        this.doc
      );
      if (firstChildAttr.length) {
        const childName = firstChildAttr[0].nodeValue;
        docs = select(
          `/xs:element[@name='${childName}']/xs:annotation/xs:documentation`,
          this.doc
        );
      }
    }

    if (docs.length > 0) {
      text.doc = docs[0].innerHTML;
    }

    if (node.show == undefined || node.show == null) {
      node.show = !node.attributes && !node.values;
    }
    setTimeout(() => {
      if (node && node.attributes) {
        for (const i in node.attributes) {
          this.checkAttrsText(node.attributes[i], select);
        }
      }
    }, 0);

    return text;
  }


  // BreadCrumb
  createBreadCrumb(node): void {
    if ((this.nodes[0] && this.nodes[0].ref === node.parent && this.nodes[0].uuid == node.parentId) || (this.nodes[0] && this.nodes[0].name === node.parent && this.nodes[0].uuid == node.parentId)) {
      this.breadCrumbArray.push(this.nodes[0]);
    } else {
      if (this.nodes[0] && this.nodes[0].children && this.nodes[0].children.length > 0) {
        for (let i = 0; i < this.nodes[0].children.length; i++) {
          this.createBreadCrumbRecursion(node, this.nodes[0].children[i]);
        }
      }
    }
  }

  createBreadCrumbRecursion(node, nodes): void {
    if ((nodes && nodes.ref === node.parent && nodes.uuid == node.parentId) || (nodes && nodes.name === node.parent && nodes.uuid == node.parentId)) {
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
  autoExpand(exNode): void {
    exNode.expanded = true;
    this.updateTree();
  }

  // expand particular node
  expandNode(node): void {
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
              if ((node.children[j].choice && node.children[j].ref === this.childNode[i].ref) || (node.children[j].choice && node.children[j].name === this.childNode[i].name)) {
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
  removeNode(node): void {
    this.dRefFlag = 0;
    if (node.origin) {
      if (node.origin.parent === '#') {
      } else {
        if (node.parentNode.origin) {
          this.deleteData(node.parentNode.origin.children, node.origin, node.parentNode.origin);
        }
      }
    } else {
      if (node.parent === '#') {
      } else {
        this.getParent(node, this.nodes[0]);
      }
    }
    if (((node.origin && this.selectedNode.ref === node.origin.ref) || (this.selectedNode.ref === node.ref)) || ((node.origin && this.selectedNode.name === node.origin.name) || (this.selectedNode.name === node.name))) {
      this.selectedNode = this.nodes[0];
      this.selectedNodeDoc = this.checkText(this.nodes[0]);
      this.getIndividualData(this.selectedNode, undefined);
    }
    this.extraInfo.released = false;
    this.isChange = true;
    this.validateSer(false);
  }

  getParent(node, list) {
    if (node.parentId == list.uuid && list.parent === '#') {
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
        if ((node.ref === parentNode[i].ref && node.uuid == parentNode[i].uuid) || (node.name === parentNode[i].name && node.uuid == parentNode[i].uuid)) {
          this.validConfig = false;
          parentNode.splice(i, 1);
          this.updateTree();
          this.printArraya(false);
          this.getData(parent);
        }
      }
      if (node.keyReference) {
        this.checkRefPresent(node, this.nodes[0]);
      }
    }
  }

  checkRefPresent(node, child) {
    if (child.ref == node.ref || child.name == node.name) {
      if (child.attributes) {
        for (let i = 0; i < child.attributes.length; i++) {
          for (let j = 0; j < node.attributes.length; j++) {
            if (child.attributes[i].name == node.attributes[j].name) {
              this.dRefFlag++;
              break;
            }
          }
        }
      }
    } else {
      if (child.nodes && child.nodes.length > 0) {
        for (let i = 0; i < child.nodes.length; i++) {
          this.checkRefPresent(node, child.nodes[i]);
        }
      }
    }
    if (this.dRefFlag < 1) {
      if (this.nodes[0].keyref) {
        if (this.nodes[0].attributes.length > 0) {
          for (let i = 0; i < this.nodes[0].attributes.length; i++) {
            if (this.nodes[0].keyref === this.nodes[0].attributes[i].name) {
              for (let j = 0; j < node.attributes.length; j++) {
                if (node.attributes[j].name == node.keyReference) {
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

  deleteKeyRefData(child, node) {
    if (child.keyref) {
      if (child.attributes && child.attributes.length > 0) {
        for (let i = 0; i < child.attributes.length; i++) {
          if (child.keyref === child.attributes[i].name) {
            if (node.attributes) {
              for (let j = 0; j < node.attributes.length; j++) {
                if (node.attributes[j].name === node.keyReference) {
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
  }

  // searchNode
  searchAndRemoveNode(node) {
    if (node.parent === this.nodes[0].ref && node.parentId == this.nodes[0].uuid) {
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
  copyNode(node): void {
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

    if (this.copyItem) {
      this.coreService.showCopyMessage(this.message);
    }
  }

  // check rules before paste
  private checkRules(pasteNode, copyNode): void {
    if (copyNode !== undefined) {
      this.checkRule = false;
      if ((pasteNode.ref === copyNode.parent) || (pasteNode.name === copyNode.parent)) {
        let count = 0;
        if (copyNode.maxOccurs === 'unbounded') {
          this.checkRule = true;
        } else if (copyNode.maxOccurs !== 'unbounded' && copyNode.maxOccurs !== undefined) {
          if (pasteNode.children.length > 0) {
            for (let i = 0; i < pasteNode.children.length; i++) {
              if ((copyNode.ref === pasteNode.children[i].ref) || (copyNode.name === pasteNode.children[i].name)) {
                count++;
              }
            }
            this.checkRule = copyNode.maxOccurs !== count;
          } else if (pasteNode.children.length === 0) {
            this.checkRule = true;
          }
        } else if (copyNode.maxOccurs === undefined) {
          if (pasteNode.children.length > 0) {
            let flag = true;
            for (let i = 0; i < pasteNode.children.length; i++) {
              if ((copyNode.ref === pasteNode.children[i].ref) || (copyNode.name === pasteNode.children[i].name)) {
                flag = false;
                break;
              }
            }
            this.checkRule = flag;
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
  pasteNode(node): void {
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
          if ((a[i].ref === this.copyItem.ref) || (a[i].name === this.copyItem.name)) {
            this.copyItem.order = i;
            break;
          }
        }
      }
    }
    if (this.copyItem.children) {
      this.copyItem.children.forEach((res: any) => {
        this.changeUuid(res, this.copyItem.uuid);
        this.changeParentId(res, this.copyItem.uuid);
      });
    }
    let copyData = this.coreService.clone(this.copyItem);
    if (node.ref === 'Profiles' && !this.cutData) {
      let tName;
      if (copyData && copyData.attributes) {
        for (let i = 0; i < copyData.attributes.length; i++) {
          if (copyData.attributes[i].name === 'profile_id' && copyData.attributes[i].data) {
            for (let j = 0; j < node.children.length; j++) {
              for (let k = 0; k < node.children[j].attributes.length; k++) {
                if (node.children[j].attributes[k].name === 'profile_id' && node.children[j].attributes[k].data) {
                  if (node.children[j].attributes[k].data.match(/-copy[0-9]+/i)) {
                    tName = node.children[j].attributes[k].data;

                    break;
                  }
                }
              }
            }
          }
          if (!tName && copyData.attributes[i].data) {
            tName = clone(copyData.attributes[i].data + '-copy1');
          } else if (tName) {
            if (tName !== copyData.attributes[i].data && tName.split('-copy')) {
              let xz = tName.split('-copy');
              tName = xz[xz.length - 1];
              tName = parseInt(tName, 10) || 0;
            } else {
              tName = 0;
            }
            tName = clone((copyData.attributes[i].data || 'profile') + '-copy' + (tName + 1));

          }
          if (tName) {
            copyData.attributes[i].data = clone(tName);
          }
          break;
        }
      }
    }
    node.children.push(Object.assign({}, copyData));
    node.children = sortBy(node.children, 'order');
    this.cutData = false;
    this.checkRule = true;
    for (const i in node.children) {
      if (node.children[i].uuid === copyData.uuid) {
        this.selectedNode = node.children[i];
        this.selectedNodeDoc = this.checkText(node.children[i]);
        break;
      }
    }
    this.getIndividualData(this.selectedNode, undefined);
    this.scrollTreeToGivenId(this.selectedNode.uuid);
    this.extraInfo.released = false;
    this.isChange = true;
    this.printArraya(false);
    this.validateSer(false);
  }

  renameTab(tab): void {
    if (this.schemaIdentifier) {
      tab.rename = true;
      this.oldName = clone(tab.name);
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
        data.name = clone(this.oldName);
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
    }).subscribe({
      next: () => {
        this.oldName = null;
      }, error: (err) => {
        data.name = this.oldName;
        this.showErrorToast(err.data.error.message, '');
      }
    });
  }

  renameDone(data) {
    if (data.name && data.name !== this.oldName) {
      this.renameFile(data);
    } else {
      data.name = clone(this.oldName);
      this.oldName = null;
    }
    delete data['rename'];
  }

  cancelRename(data) {
    delete data['rename'];
    data.name = clone(this.oldName);
    this.oldName = null;
  }

// Show all Child Nodes and search functionalities.
  showAllChildNode(node): void {
    this.showAllChild = [];
    const obj = {ref: node.ref || node.name, parent: node.parent, children: [], expanded: true};
    this.checkChildNode(obj, obj);
    this.counter = 0;
    this.getAllChild(obj.children);
    this.showAllChild.push(obj);
    this.modal.create({
      nzTitle: undefined,
      nzClassName: 'lg',
      nzContent: ShowChildModalComponent,
      nzData: {
        showAllChild: this.showAllChild,
        doc: this.doc,
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  // key and Key Ref Implementation code
  xpath() {
    const select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let a;
    if (this.nodes[0]) {
      a = this.nodes[0].ref || this.nodes[0].name;
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
              keyattrs.keyReference = this.strReplace(this.keyNodes[i].ownerElement.childNodes[j].attributes[k].nodeValue);
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

  getKeyRef(keyRefNodes): void {
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

  attachKey(key): void {
    this.AddKeyAndKeyref(key);
  }

  attachKeyRefNodes(keyrefnodes): void {
    this.AddKeyAndKeyref(keyrefnodes);
  }

  AddKeyAndKeyref(nodes): void {
    let k = false;
    let keyre = false;
    for (let key in nodes) {
      if (key === 'keyReference') {
        k = true;
        break;
      } else if (key === 'keyref') {
        keyre = true;
        break;
      }
    }
    if (this.nodes[0] && this.nodes[0].children) {
      for (let i = 0; i < this.nodes[0].children.length; i++) {
        if ((this.nodes[0].children[i].ref === nodes.name) || (this.nodes[0].children[i].name === nodes.name)) {
          if (k) {
            this.nodes[0].children[i].keyReference = nodes.keyReference;
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
        if (key === 'keyReference') {
          ke = true;
          break;
        } else if (key === 'keyref') {
          keyref = true;
          break;
        }
      }
      for (let i = 0; i < child.length; i++) {
        if ((child[i].ref === showAllChild.name) || (child[i].name === showAllChild.name)) {
          if (ke) {
            child[i].keyReference = showAllChild.keyReference;
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
          key = Object.assign(key, {refe: this.nodes[0].ref || this.nodes[0].name, name: this.nodes[0].attributes[i].refer});
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
          key = Object.assign(key, {refe: child.ref || child.name, name: child.attributes[i].refer});
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

  attachKeyReferencing(key): void {
    if (key.name) {
      if ((this.nodes[0].ref === key.name && this.nodes[0].keyReference) || (this.nodes[0].name === key.name && this.nodes[0].keyReference)) {
        for (let i = 0; i < this.nodes[0].attributes.length; i++) {
          if (this.nodes[0].attributes[i].name === this.nodes[0].keyReference) {
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

  attachKeyReferencingRecursion(key, child): void {
    if (key.name) {
      if ((child.ref === key.name && child.keyReference && child.attributes) || (child.name === key.name && child.keyReference && child.attributes)) {
        for (let i = 0; i < child.attributes.length; i++) {
          if (child.attributes[i].name === child.keyReference) {
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

  // validation for attributes
  validateAttr(value, tag): void {
    if (tag.refElement && this.previousName) {
      if (value === this.previousName) {
        this.previousName = null;
        return;
      }
      this.getReferenceByName(this.previousName, tag);
    }
    this.previousName = null;
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
          this.text = tag.name + ': ' + this.onlyNumbers;
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
          this.error = true;
          this.text = tag.name + ': ' + this.onlyNumbers;
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
      }
    } else if (tag.type === 'xs:anyURI') {
      if (value) {
        if (value === '' && tag.use === 'required') {
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
        } else if (!(this.coreService.xsdAnyURIValidation(value))) {
          this.error = true;
          this.text = tag.name + ': ' + this.notValidUrl;
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
      }
    } else {
      tag = Object.assign(tag, {data: value});
      this.autoValidate();
    }
  }

  stopPressingSpace(id): void {
    $('#' + id).keypress((e) => {
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
      }
    });
  }

  updateListData(node): void {
    node.data = node.data1.join(' ');
    this.extraInfo.released = false;
    this.isChange = true;
  }

  upperCase(env): void {
    if (env.data) {
      env.data = env.data.toUpperCase();
    }
  }

  submitData(value, tag) {
    this.isChange = true;
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
        this.text = tag.name + ': ' + this.onlyNumbers;
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
        this.error = true;
        this.text = tag.name + ': ' + this.onlyNumbers;
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
    } else if (tag.type === 'xs:anyURI') {
      if (value) {
        if (value === '' && tag.use === 'required') {
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
        }
        if ((this.coreService.xsdAnyURIValidation(value)) === false) {
          this.error = true;
          this.text = tag.name + ': ' + this.notValidUrl;
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
    this.extraInfo.released = false;
    this.extraInfo.deployed = false;
  }

// validation for node value property
  validValue(value, ref, tag): void {
    if (/^\s*$/.test(value)) {
      this.error = true;
      this.text = this.requiredField;
      this.errorName = ref;
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
    this.isChange = true;
    if (/^\s*$/.test(value)) {
      this.error = true;
      this.text = this.requiredField;
      this.errorName = ref;
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
    this.extraInfo.released = false;
  }

  getDataAttr(refer): void {
    this.tempArr = [];
    if (this.nodes[0] && this.nodes[0].children) {
      this.keyRecursion(refer, this.nodes[0].children);
    }
  }

  keyRecursion(refer, childNode): void {
    let temp;
    for (let i = 0; i < childNode.length; i++) {
      if (childNode[i].ref === refer || childNode[i].name === refer) {
        if (childNode[i].keyReference) {
          temp = childNode[i].keyReference;
          if (childNode[i].attributes) {
            for (let j = 0; j < childNode[i].attributes.length; j++) {
              if (childNode[i].attributes[j].name === temp) {
                if (childNode[i].attributes[j] && childNode[i].attributes[j].data) {
                  this.tempArr.push(childNode[i].attributes[j].data);
                }
              }
            }
          }
        }
      } else {
        if (childNode[i] && childNode[i].children) {
          this.keyRecursion(refer, childNode[i].children);
        }
      }
    }
  }

  // link gotokey
  gotoKey(node): void {
    if (node !== undefined) {
      if (node.refer === this.nodes[0].ref|| node.refer === this.nodes[0].name) {
        if (this.nodes[0].keyReference) {
          for (let i = 0; i < this.nodes[0].attributes.length; i++) {
            if (this.nodes[0].attributes[i].name === this.nodes[0].keyReference) {
              if (node.data === this.nodes[0].attributes[i].data) {
                this.getData(this.nodes[0]);
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

  gotoKeyRecursion(node, child): void {
    if (node !== undefined) {
      if (node.refer === child.ref|| node.refer === child.name) {
        if (child.keyReference) {
          for (let i = 0; i < child.attributes.length; i++) {
            if (child.attributes[i].name === child.keyReference) {
              if (node.data === child.attributes[i].data) {
                this.getData(child);
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

  gotoKeyref(node): void {
    if (node !== undefined) {
      if ((node.refElement === this.nodes[0].ref) || (node.refElement === this.nodes[0].name)) {
        if (this.nodes[0].keyref) {
          for (let i = 0; i < this.nodes[0].attributes.length; i++) {
            if (this.nodes[0].attributes[i].name === this.nodes[0].keyref) {
              if (node.data === this.nodes[0].attributes[i].data) {
                this.getData(this.nodes[0]);
              }
            }
          }
        } else {
          for (let i = 0; i < this.nodes[0].children.length; i++) {
            this.gotoKeyRefRecursion(node, this.nodes[0].children[i]);
          }
        }
      } else if ((this.refElement && this.refElement.parent === this.nodes[0].ref) || (this.refElement && this.refElement.parent === this.nodes[0].name)) {
        if (this.nodes[0].keyref) {
          for (let i = 0; i < this.nodes[0].attributes.length; i++) {
            if (this.nodes[0].attributes[i].name === this.nodes[0].keyref) {
              if (node.data === this.nodes[0].attributes[i].data) {
                this.getData(this.nodes[0]);
              }
            }
          }
        } else {
          for (let i = 0; i < this.nodes[0].children.length; i++) {
            this.gotoKeyRefRecursion(node, this.nodes[0].children[i]);
          }
        }
      } else {
        for (let i = 0; i < this.nodes[0].children.length; i++) {
          this.gotoKeyRefRecursion(node, this.nodes[0].children[i]);
        }
      }
      this.scrollTreeToGivenId(this.selectedNode.uuid);
    }
  }

  gotoKeyRefRecursion(node, child): void {
    if (node !== undefined) {
      if (node.refElement === child.ref || node.refElement === child.name) {
        if (child.keyref) {
          if (child.attributes) {
            for (let i = 0; i < child.attributes.length; i++) {
              if (child.attributes[i].name === child.keyref) {
                if (node.data === child.attributes[i].data) {
                  this.getData(child);
                }
              }
            }
          }
        } else {
          if (child.children) {
            for (let i = 0; i < child.children.length; i++) {
              this.gotoKeyRefRecursion(node, child.children[i]);
            }
          }
        }
      } else if ((this.refElement && this.refElement.parent === child.ref) || (this.refElement && this.refElement.parent === child.name)) {
        if (child.keyref) {
          for (let i = 0; i < child.attributes.length; i++) {
            if (child.attributes[i].name === child.keyref) {
              if (node.data === child.attributes[i].data) {
                this.getData(child);
              }
            }
          }
        } else {
          if (child.children) {
            for (let i = 0; i < child.children.length; i++) {
              this.gotoKeyRefRecursion(node, child.children[i]);
            }
          }
        }
      } else {
        if (child.children) {
          for (let i = 0; i < child.children.length; i++) {
            this.gotoKeyRefRecursion(node, child.children[i]);
          }
        }
      }
    }
  }

  private getReferenceByName(refName, data): void {
    for (let i = 0; i < this.nodes[0].children.length; i++) {
      getRecursively(data, this.nodes[0].children[i]);
    }

    function getRecursively(node, child): void {
      if ((node.refElement === child.ref) || (node.refElement === child.name)) {
        if (child.keyref) {
          if (child.attributes) {
            for (let i = 0; i < child.attributes.length; i++) {
              if (child.attributes[i].name === child.keyref) {
                if (refName === child.attributes[i].data) {
                  child.attributes[i].data = node.data;
                }
              }
            }
          }
        } else {
          if (child.children) {
            for (let i = 0; i < child.children.length; i++) {
              getRecursively(node, child.children[i]);
            }
          }
        }
      } else {
        if (child.children) {
          for (let i = 0; i < child.children.length; i++) {
            getRecursively(node, child.children[i]);
          }
        }
      }
    }
  }

  addKey(node: any): void {
    for (let i = 0; i < node.length; i++) {
      node[i].key = node[i].uuid;
      if (node[i].children && node[i].children.length > 0) {
        this.addKey(node[i].children);
      }
    }
  }

  // import xml model
  importXML(): void {
    if (this.objectType === 'OTHER') {
      if (localStorage.getItem('schemas')) {
        this.otherSchema = localStorage.getItem('schemas').split(',');
      }
    } else {
      if (localStorage.getItem('yadeSchema')) {
        this.otherSchema = localStorage.getItem('yadeSchema').split(',');
      }
    }
    let importObj = {assignXsd: this.objectType};
    if (this.objectType !== 'NOTIFICATION') {
      importObj = {assignXsd: this.schemaIdentifier};
    }
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: FileUploaderComponent,
      nzClassName: 'lg',
      nzData: {
        type: 'XML_EDITOR',
        importObj,
        otherSchema: this.otherSchema,
        importXsd: false,
        display: this.preferences.auditLog,
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(res => {
      if (res) {
        this.schemaIdentifier = importObj.assignXsd;
        if (importObj.assignXsd) {
          if (!this.ok(res.uploadData)) {
            this.uploadData = res.uploadData;
            this.copyItem = undefined;
            this.selectedXsd = importObj.assignXsd;
            this.isLoading = true;
            if (this.objectType !== 'NOTIFICATION') {
              if (this.tabsArray.length === 0) {
                let _tab = {id: -1, name: 'edit1', schemaIdentifier: this.schemaIdentifier};
                this.tabsArray.push(_tab);
                this.activeTab = _tab;
              }
              this.getXsdSchema();
            } else {
              this.extraInfo.released = false;
              this.extraInfo.deployed = false;
              this.xmlToJsonService(res.uploadData);
            }
          } else {
            this.openXMLDialog(res.uploadData);
          }
        }
      }
    });
  }

  getXsdSchema(): void {
    let obj = {
      controllerId: this.schedulerIds.selected,
      objectType: this.objectType,
      uri: this.schemaIdentifier
    };
    this.coreService.post('xmleditor/schema/assign', obj).subscribe({
      next: (res: any) => {
        if (res.schema) {
          this.path = res.schema;
          this.schemaIdentifier = res.schemaIdentifier;
          this.xmlToJsonService(this.uploadData);
        }
      }, error: (err) => {
        this.showErrorToast(err.data.error.message, '');
        this.isLoading = false;
      }
    });
  }

  hideError(): void {
    this.error = false;
  }

  getAutoFocus(index, node, type): any {
    if (node) {
      if (type === 'attribute' && node) {
        if (this.errorName && this.errorName === node.name) {
          return 'true';
        } else if (((this.errorName && this.errorName !== node.ref) || !this.errorName) && index == 0) {
          return 'true';
        } else {
          return 'false';
        }
      } else if (type === 'value' && node) {
        if (this.errorName && this.errorName === node.ref) {
          return 'true';
        } else if (node && !node.attributes) {
          return 'true';
        }
      }
    }
    return false;
  }

  showPassword(data): void {
    data.pShow = !data.pShow;
  }

  checkForTab(id): void {
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

  // open new Confirmation model
  newFile(): void {
    if (this.objectType === 'NOTIFICATION') {
      if (this.preferences.auditLog) {
        let comments = {
          radio: 'predefined',
          type: 'Notification',
          operation: 'Create',
          name: ''
        };
        const modal = this.modal.create({
          nzTitle: undefined,
          nzContent: CommentModalComponent,
          nzData: {
            comments,
          },
          nzFooter: null,
          nzAutofocus: null,
          nzClosable: false,
          nzMaskClosable: false
        });
        modal.afterClose.subscribe(result => {
          if (result) {

            this.copyItem = undefined;
            this.nodes = [];
            this.selectedNode = {};
            this.newConf({
              comment: result.comment,
              timeSpent: result.timeSpent,
              ticketLink: result.ticketLink
            });
          }
        });
      } else {
        if (this.submitXsd) {
          const modal = this.modal.create({
            nzTitle: undefined,
            nzContent: ConfirmationModalComponent,
            nzData: {
              save: this.save2,
              assignXsd: this.newXsdAssign,
              self: this
            },
            nzFooter: null,
            nzClosable: false,
            nzMaskClosable: false
          });
          modal.afterClose.subscribe((result) => {
            if (result) {
              this.copyItem = undefined;
              this.nodes = [];
              this.selectedNode = {};
              this.newConf();
            }
          });
        } else {
          this.copyItem = undefined;
          this.nodes = [];
          this.selectedNode = {};
          this.newConf();
        }
      }
    } else {
      this.isChange = true;
      this.storeXML(this.activeTab, true);
      this.nodes = [];
      this.selectedNode = {};
      this.selectedXsd = undefined;
      this.copyItem = undefined;
      this.createNewTab();
    }
  }

  importXSD(): void {
    this.importXSDFile = true;
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: FileUploaderComponent,
      nzClassName: 'lg',
      nzData: {
        type: 'XML_EDITOR',
        importXsd: true
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(res => {
      if (res) {
        this.uploadData = res.uploadData;
        if (!this.ok(this.uploadData)) {
          if (this.reassignSchema) {
            this.changeSchema(res);
          } else {
            this.othersSubmit(res);
          }
          this.importXSDFile = false;
        }
      }
    });

  }

  othersSubmit(data): void {
    this.isLoading = true;
    if (!this.selectedXsd && this.otherSchema.length > 0) {
      this.selectedXsd = this.otherSchema[0];
    }
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
    this.coreService.post('xmleditor/schema/assign', obj).subscribe({
      next: (res: any) => {
        this.schemaIdentifier = res.schemaIdentifier;
        this.loadTree(res.schema, false);
        this.submitXsd = true;
        this.prevXML = '';
        this.isLoading = false;
        this.isChange = true;
        this.storeXML(this.activeTab);
      }, error: (error) => {
        this.isLoading = false;
        if (error && error.error) {
          this.showErrorToast(error.error.message, '');
        }
      }
    });
  }

  changeSchema(data): void {
    this.isLoading = true;
    let obj;
    let xml = this._showXml();
    if (!xml) {
      return;
    }
    if (!this.importXSDFile) {
      obj = {
        controllerId: this.schedulerIds.selected,
        objectType: this.objectType,
        uri: this.selectedXsd,
        configuration: xml
      };
    } else {
      obj = {
        controllerId: this.schedulerIds.selected,
        objectType: this.objectType,
        fileName: data._file.name,
        fileContent: this.uploadData,
        configuration: xml
      };
    }
    this.coreService.post('xmleditor/schema/reassign', obj).subscribe({
      next: (res: any) => {
        this.doc = new DOMParser().parseFromString(res.schema, 'application/xml');
        this.nodes = [];
        this.nodes.push(JSON.parse(res.configurationJson));
        this.getIndividualData(this.nodes[0], undefined);
        this.getData(this.nodes[0]);
        this.submitXsd = true;
        this.activeTab.schemaIdentifier = res.schemaIdentifier;
        this.showSelectSchema = false;
        this.prevXML = '';
        this.schemaIdentifier = res.schemaIdentifier;
        this.isChange = true;
        this.storeXML(this.activeTab);
        this.path = res.schemaIdentifier;
        this.selectedXsd = res.schemaIdentifier;
        this.isLoading = false;
        this.reassignSchema = false;
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  changeLastUUid(node): void {
    this.lastScrollId = clone(node.uuid);
  }

  newXsdAssign(self): void {
    self.nodes = [];
    self.selectedNode = {};
    self.submitXsd = false;
  }

  getPos(id): void {
    $('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover focus manual',
      html: true,
      delay: {show: 500, hide: 200}
    });
    const a = '#' + id;
    $(a).tooltip('show');
  }

  // create Xml from Json
  showXml(): void {
    const xml = this._showXml(this.nodes, true);
    if (!xml) {
      return;
    }
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ShowModalComponent,
      nzClassName: 'lg script-editor',
      nzData: {
        xml,
        schedulerId: this.schedulerIds.selected,
        objectType: this.objectType,
        schemaIdentifier: this.schemaIdentifier,
        tabSize: this.preferences.tabSize,
        activeTab: this.activeTab
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(res => {
      if (res) {
        if (res.configurationJson) {
          this.updateXML(res);
        } else if (this.objectType === 'NOTIFICATION') {
          let obj = {
            objectType: this.objectType
          };
          this.coreService.post('notification', obj).subscribe({
            next: (res: any) => {
              this.updateXML(res);
            }
          });
        }
      }
    });
  }

  private updateXML(res) {
    if (res && res.configurationJson) {
      let a = [];
      let arr = JSON.parse(res.configurationJson);
      a.push(arr);
      this.counting = arr.lastUuid;
      this.doc = new DOMParser().parseFromString(this.path, 'application/xml');
      this.nodes = a;
      this.submitXsd = true;
      this.extraInfo = {
        released: res.released,
        state: res.state,
        hasReleases: res.hasReleases,
        configurationDate: res.configurationDate,
        modified: res.configuration ? res.configuration.modified : ''
      };
      this.prevXML = '';
      this.getIndividualData(this.nodes[0], undefined);
      this.getData(this.nodes[0]);
      if (this.nodes.length > 0 && this.nodes[0].children && this.nodes[0].children.length > 0) {
        for (const i in this.nodes[0].children) {
          if (this.nodes[0].children[i].ref === 'JobResource') {
            for (const j in this.nodes[0].children[i].attributes) {
              if (this.nodes[0].children[i].attributes[j].name === 'name') {
                this.getJobResourceTree(this.nodes[0].children[i].attributes[j]);
                break;
              }
            }
            break;
          }
        }
      }
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
        this.createChildJson(curentNode, childrenNode.children[i], doc.createElement(childrenNode.children[i].ref || childrenNode.children[i].name), doc);
      }
    }
    node.appendChild(curentNode);
  }

  // save xml
  save(): void {
    const xml = this._showXml(this.nodes, true);
    if (!xml) { return; }

    const name = this.objectType !== 'NOTIFICATION'
      ? this.activeTab.name + '.xml'
      : 'Notification.xml';

    const blob = new Blob([xml], { type: 'application/xml' });
    saveAs(blob, name);
  }


  downloadSchema(objType, schemaIdentifier): void {
    let link = window.location.origin + '/joc/api/xmleditor/schema/download?controllerId='
      + this.schedulerIds.selected + '&objectType=' + objType +
      '&accessToken=' + this.authService.accessTokenId;
    if (objType !== 'NOTIFICATION') {
      link = link + '&schemaIdentifier=' + encodeURIComponent(schemaIdentifier);
    }
    $('#tmpFrame').attr('src', link);
  }

  showXSD(objType, schemaIdentifier): void {
    let windowProperties = ',scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no';
    let link = window.location.origin + '/joc/api/xmleditor/schema/download?show=true&controllerId='
      + this.schedulerIds.selected + '&objectType=' + objType + '&accessToken='
      + this.authService.accessTokenId;
    if (objType !== 'NOTIFICATION') {
      link = link + '&schemaIdentifier=' + encodeURIComponent(schemaIdentifier);
    }

    let newWindow;
    if (this.preferences.isDocNewWindow === 'newWindow') {
      newWindow = window.open('assets/preview.html', 'XSD, top=0,left=0' + windowProperties);
    } else {
      newWindow = window.open('assets/preview.html', '_blank');
    }
    const iframeContent = '<iframe width="100%" height="100%" frameborder="0" src="' + link + '"></iframe>';
    setTimeout(() => {
      newWindow.document.body.innerHTML = (iframeContent);
    }, 50);
  }

  save2(self): void {
    self.save();
    self.nodes = [];
    self.selectedNode = {};
    self.submitXsd = false;
  }

  // validate xml
  validate(): void {
    this.autoValidate();
    if (isEmpty(this.nonValidattribute)) {
      this.validateSer();
    } else {
      this.popToast(this.nonValidattribute);
      if (this.nonValidattribute.base) {
        this.error = true;
        this.errorName = this.nonValidattribute.parent;
        this.text = this.requiredField;
      }
      if (this.nonValidattribute.name) {
        this.validateAttr('', this.nonValidattribute);
      }
      this.gotoErrorLocation();
    }
  }

  // toaster pop toast
  popToast(node): void {
    let msg;
    if (node && node.name) {
      msg = 'Attribute "' + node.name + '" cannot be empty';

    } else {
      msg = 'cannot be empty';
    }
    this.showErrorToast(msg, 'Element : ' + node.parent);
  }

  // goto error location
  gotoErrorLocation(): void {
    if (this.errorLocation && this.errorLocation.ref) {
      this.getData(this.errorLocation);
      this.errorLocation = {};
      if (this.errorName && this.errorName === this.selectedNode.ref) {
        this.getAutoFocus(0, this.selectedNode, 'value');
      }
      if (this.nodes[0] && (this.nodes[0].expanded === false || this.nodes[0].expanded === undefined)) {
        this.nodes[0].expanded = true;
        this.autoExpand(this.nodes[0]);
      }
      this.scrollTreeToGivenId(this.selectedNode.uuid);
    }
  }

  // create json from xml
  createJsonFromXml(data): void {
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
    if ((this.nodes[0] && this.nodes[0].ref === rootNode) || (this.nodes[0] && this.nodes[0].name === rootNode)) {
      this.createJsonAccToXsd(json, r_node, this.nodes[0]);
    } else {
      this.nodes = [{}];
      this.createNormalTreeJson(json, r_node, this.nodes[0], '#');
    }
  }

  createTempJson(editJson, rootNode) {
    let temp: any = {};
    if (isArray(editJson[rootNode])) {
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
          if (isArray(editJson[rootNode][a])) {
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
      if (editJson && isArray(editJson[key])) {
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
        this.addChildForXML(key, rootNode, xmljson, mainjson);
      }
    }
  }

  addChildForXML(key, rootNode, xmljson, mainjson) {
    let a;
    if (key.indexOf('*')) {
      a = key.split('*')[0];
    }
    this.checkChildNode(mainjson, undefined);
    for (let i = 0; i < this.childNode.length; i++) {
      if (a === this.childNode[i].ref || a === this.childNode[i].name) {
        this.childNode[i].import = key;
        this.addChild(this.childNode[i], mainjson, false, i);
      }
    }
    for (let i = 0; i < mainjson.children.length; i++) {
      if ((mainjson.children[i].ref === a && mainjson.children[i].import === key) || (mainjson.children[i].name === a && mainjson.children[i].import === key)) {
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
      if ((mainjson.children[i].ref === a && mainjson.children[i].import === key) || (mainjson.children[i].name === a && mainjson.children[i].import === key)) {
        this.createNormalTreeJson(xmljson[rootNode], key, mainjson.children[i], rootNode);
      }
    }
  }

  removeTag(data): string {
    if (typeof data.data === 'string' && data && data.data && data.data.match(/<[^>]+>/gm)) {
      let x = data.data.replace(/<\/p><p>/gm, '</p> <p>');
      x = x.replace(/<[^>]+>/gm, '');
      return x;
    } else {
      return data.data;
    }
  }

  addContent(data): void {
    if (data && data[0] && data[0].data !== undefined) {
      this.myContent = data[0].data;
    } else {
      this.myContent = '';
    }
  }

  passwordLabel(password: any): string {
    if (password !== undefined) {
      return '********';
    } else {
      return '';
    }
  }

  hidePanel(): void {
    this.sideView.xml.show = false;
    this.coreService.hideConfigPanel();
  }

  showPanel(): void {
    this.sideView.xml.show = true;
    this.coreService.showConfigPanel();
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

  private createNewTab(): void {
    let _tab;
    if (this.tabsArray.length === 0) {
      _tab = {id: -1, name: 'edit1'};
    } else {
      let tempName;
      _tab = clone(this.tabsArray[this.tabsArray.length - 1]);
      _tab.id = Math.sign(clone(_tab.id - 1)) === 1 ? -1 : clone(_tab.id - 1);
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
        _tab.name = clone('edit' + (parseInt(tempName.match(/\d+/g)[0], 10) + 1));
      } else {
        _tab.name = 'edit1';
      }
    }

    _tab.schemaIdentifier = null;
    this.tabsArray.push(_tab);
    this.reassignSchema = false;
    this.activeTab = _tab;
    setTimeout(() => {
      this.selectedTabIndex = this.tabsArray.length - 1;
    }, 0);
    if (this.objectType === 'OTHER') {
      if (_tab.id > 0) {
        this.readOthersXSD(_tab.id);
      }
    } else {
      this.submitXsd = true;
      this.showSelectSchema = false;
      this.selectedXsd = this.schemaIdentifier;
      this.othersSubmit(null);
    }
  }

  private jsonToXml(nodes) {
    if (nodes.length > 0) {
      let doc = document.implementation.createDocument('', '', null);
      let peopleElem = doc.createElement(nodes[0].ref);
      if (peopleElem) {
        if (nodes[0].attributes && nodes[0].attributes.length > 0) {
          for (let i = 0; i < nodes[0].attributes.length; i++) {
            if (nodes[0].attributes[i].data) {
              peopleElem.setAttribute(nodes[0].attributes[i].name, nodes[0].attributes[i].data);
            }
          }
        }
        if (nodes[0] && nodes[0].values && nodes[0].values.length >= 0) {
          for (let i = 0; i < nodes[0].values.length; i++) {
            if (nodes[0].values[0].data) {
              peopleElem.createCDATASection(nodes[0].values[0].data);
            }
          }
        }
        if (nodes[0].children && nodes[0].children.length > 0) {
          for (let i = 0; i < nodes[0].children.length; i++) {
            this.createChildJson(peopleElem, nodes[0].children[i], doc.createElement(nodes[0].children[i].ref),doc);
          }
        }
      }
      return peopleElem;
    }
  }

  private del(tab) {
    if (tab?.id < 0) {
      this.tabsArray = this.tabsArray.filter(x => {
        return x.id !== tab.id;
      });
      if (this.tabsArray.length > 0) {
        if (this.activeTab.id === tab.id) {
          this.changeTab(this.tabsArray[this.tabsArray.length - 1]);
        }
      }
      return;
    }
    let obj: any = {
      controllerId: this.schedulerIds.selected,
      objectType: this.objectType,
      id: tab?.id
    };

    this.coreService.post('xmleditor/remove', obj).subscribe({
      next: (res: any) => {

        if (res.configuration) {
          if (!this.ok(res.configuration)) {
            let obj1: any = {
              controllerId: this.schedulerIds.selected,
              objectType: this.objectType,
              configuration: res.configuration
            };

            obj1.schemaIdentifier = this.schemaIdentifier;

            this.coreService.post('xmleditor/xml2json', obj1).subscribe({
              next: (result: any) => {
                this.isLoading = true;
                let a = [];
                let arr = JSON.parse(result.configurationJson);
                a.push(arr);
                this.counting = arr.lastUuid;
                this.doc = new DOMParser().parseFromString(this.path, 'application/xml');
                this.nodes = a;
                this.isLoading = false;
                this.selectedNode = this.nodes[0];
                this.selectedNodeDoc = this.checkText(this.nodes[0]);
                this.getIndividualData(this.selectedNode, undefined);
                this.submitXsd = true;
                this.prevXML = this.removeComment(res.configuration);
                this.copyItem = undefined;
              }, error: (err) => {
                this.isLoading = false;
                this.error = true;
                this.showErrorToast(err.data.error.message, '');
              }
            });
          } else {
            this.afterDelete(res, tab);
          }
        } else {
          this.afterDelete(res, tab);
        }
      }, error: (error) => {
        if (error && error.error) {
          this.showErrorToast(error.error.message, '');
        }
      }
    });
  }

  private deleteNotification(obj) {
    this.coreService.post('notification/delete', obj).subscribe({
      next: (res: any) => {
        this.extraInfo = {
          released: res.released,
          state: res.state,
          hasReleases: res.hasReleases
        };
        if (res.released) {
          this.validConfig = true;
        }

        if (res.configuration) {
          if (!this.ok(res.configuration)) {
            let obj1: any = {
              controllerId: this.schedulerIds.selected,
              objectType: this.objectType,
              configuration: res.configuration
            };

            this.coreService.post('xmleditor/xml2json', obj1).subscribe({
              next: (result: any) => {
                this.isLoading = true;
                let a = [];
                let arr = JSON.parse(result.configurationJson);
                a.push(arr);
                this.counting = arr.lastUuid;
                this.doc = new DOMParser().parseFromString(this.path, 'application/xml');
                this.nodes = a;
                this.isLoading = false;
                this.selectedNode = this.nodes[0];
                this.selectedNodeDoc = this.checkText(this.nodes[0]);
                this.getIndividualData(this.selectedNode, undefined);
                this.submitXsd = true;
                this.prevXML = this.removeComment(res.configuration);
                this.copyItem = undefined;
              }, error: (err) => {
                this.isLoading = false;
                this.error = true;
                this.showErrorToast(err.data.error.message, '');
              }
            });
          } else {
            this.afterDelete(res, null);
          }
        } else {
          this.afterDelete(res, null);
        }
      }, error: (error) => {
        if (error && error.error) {
          this.showErrorToast(error.error.message, '');
        }
      }
    });
  }

  private afterDelete(res, tab): void {
    let flag = true;
    if (this.objectType !== 'NOTIFICATION') {
      flag = false;
      this.schemaIdentifier = undefined;
      this.tabsArray = this.tabsArray.filter(x => {
        return x.id !== tab.id;
      });
      if (this.activeTab.id === tab.id) {
        if (this.tabsArray.length > 0) {
          flag = true;
          this.selectedTabIndex = this.tabsArray.length - 1;
          this.changeTab(this.tabsArray[this.selectedTabIndex]);
        }
      }
    }
    if (flag || this.tabsArray.length === 0) {
      this.nodes = [];
      this.submitXsd = false;
    }
    this.isLoading = false;
  }

  private showError(error): void {
    let iNode = {
      eleName: error.elementName,
      elePos: error.elementPosition.split('-')
    };
    this.gotoInfectedElement(iNode, this.nodes);
    this.getIndividualData(this.selectedNode, true);
    this.showErrorToast(error.message, '');
    this.validConfig = false;
  }

  private gotoInfectedElement(node, nodes): void {
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
          this.selectedNodeDoc = this.checkText(this.nodes[0]);
        }
        break;
      }
    }
  }

  private storeXML(tab = null, isClone = false, auditLog?): void {
    if (!this.permission || !this.permission.joc ||
      (!this.permission.joc.fileTransfer.manage && this.objectType === 'YADE') ||
      (!this.permission.joc.notification.manage && this.objectType === 'NOTIFICATION') ||
      (!this.permission.joc.others.manage && this.objectType === 'OTHER')
    ) {
      return;
    }
    let tempNode;
    if (isClone) {
      tempNode = this.coreService.clone(this.nodes);
      this.nodes = [];
    }
    this.mainXml = this._showXml(tempNode);
    if (!this.mainXml) {
      return;
    }
    let eRes;
    if (this.prevXML && this.mainXml) {
      eRes = this.compare(this.prevXML.toString(), this.mainXml.toString());
    }
    if (!eRes && this.isChange) {
      this.isChange = false;

      this.removeDocs();
      this.isStore = true;
      if (this.objectType === 'NOTIFICATION') {
        let request = {
          configuration: this.mainXml,
          auditLog
        };
        if (!auditLog && sessionStorage['$SOS$FORCELOGING'] === 'true') {
          this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
            request.auditLog = {comment: translatedValue};
          });
        }
        this.coreService.post('notification/store', request).subscribe({
          next: () => {
            this.prevXML = this.mainXml;
            this.isStore = false;
          }, error: (error) => {
            this.isStore = false;
            if (error && error.error) {
              this.showErrorToast(error.error.message, '');
            }
          }
        });
      } else {
        this.coreService.post('xmleditor/store', {
          controllerId: this.schedulerIds.selected,
          objectType: this.objectType,
          configuration: this.mainXml,
          configurationJson: JSON.stringify({nodesCount: this.counting, node: tempNode || this.nodes}),
          id: this.activeTab.id > 0 ? this.activeTab.id : 0,
          name: this.activeTab.name,
          schemaIdentifier: this.schemaIdentifier || ((tab && tab.schemaIdentifier) ? tab.schemaIdentifier : this.path),
          schema: this.path
        }).subscribe({
          next: (res: any) => {
            this.prevXML = this.mainXml;
            this.isStore = false;
            if (tab && tab.id < 0) {
              this.extraInfo.modified = res.modified;
              tab.id = res.id;
              tab.schemaIdentifier = this.schemaIdentifier;
            }
          }, error: (error) => {
            this.isStore = false;
            if (error && error.error) {
              this.showErrorToast(error.error.message, '');
            }
          }
        });
      }
    } else {
      this.isChange = false;
    }
  }

  private compare(str1, str2): boolean {
    let a = str1.replace(/\s|\\n/g, '');
    let b = str2.replace(/\s|\\n/g, '');
    return isEqual(a, b);
  }

  private getNodeRulesData(node): void {
    if (!node.recreateJson) {
      let nod = {ref: node.parent};
      let a = this.checkChildNode(nod, undefined);
      if (a && a.length > 0) {
        for (let i = 0; i < a.length; i++) {
          if (a[i].ref === node.ref || a[i].ref === node.name) {
            node = Object.assign(node, a[i]);
          }
        }
      }
      a = this.checkChildNode(node, undefined);
      if (a && a.length > 0) {
        for (let i = 0; i < a.length; i++) {
          for (let j = 0; j < node.children.length; j++) {
            if (a[i].ref === node.children[j].ref || a[i].ref === node.children[j].name) {
              node.children[j] = Object.assign(node.children[j], a[i]);
            }
          }
        }
      }
    }
  }

  private scrollTree(id): void {
    const dom = $('#' + id);
    if (dom && dom.offset() && this.componentRef) {
      const containerHeight = this.componentRef.directiveRef.instance.containerHeight;
      const scrollbarTop = this.componentRef.directiveRef.instance.lastScrollTop;
      const scrollbarBottom = scrollbarTop + containerHeight + 200;
      if (dom.offset().top <= scrollbarBottom) {
        return;
      }
      if (this.componentRef.directiveRef.instance.lastScrollTop === 0) {
        this.componentRef.directiveRef.scrollToY(dom.offset().top - 343, 500);
      } else if (this.componentRef.directiveRef.instance.lastScrollTop > dom.offset().top) {
        this.componentRef.directiveRef.scrollToY(dom.offset().top, 0);
        setTimeout(() => {
          this.componentRef.directiveRef.scrollToY(dom.offset().top, 500);
        }, 0)
      } else {
        this.componentRef.directiveRef.scrollToY(this.componentRef.directiveRef.instance.lastScrollTop, 0);
        setTimeout(() => {
          this.componentRef.directiveRef.scrollToY(dom.offset().top, 500);
        }, 0)
      }

    }
  }

  private removeComment(data): string {
    let d = data.replace(/\<\!\-\-((?!\-\-\>)[\s\S])*\-\-\>\s*/g, '');
    return d.replace(/(\\n)/g, '');
  }

  private handleNodeToExpandAtOnce(nodes, tempArrToExpand): void {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].expanded) {
        if (nodes[i].children && nodes[i].children.length) {
          if (nodes[i].children.length > 10) {
            tempArrToExpand.push(nodes[i]);
            nodes[i].expanded = false;
            nodes[i].loading = true;
            break;
          }
          this.handleNodeToExpandAtOnce(nodes[i].children, tempArrToExpand);
        }
      }
    }
  }

  private copyNodeRecursion(node): any {
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
        } else if (key === 'children' && node[key].length > 0) {
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

  private changeParentId(node, parentId): void {
    node.parentId = parentId;
    if (node && node.children && node.children.length > 0) {
      node.children.forEach((cNode) => {
        this.changeParentId(cNode, node.uuid);
      });
    }
  }

  private changeUuid(node, id): void {
    node.uuid = id + this.counting;
    node.key = id + this.counting;
    this.counting++;
    if (node && node.children && node.children.length > 0) {
      node.children.forEach((cNode) => {
        this.changeUuid(cNode, node.uuid);
      });
    }
  }

  private getAllChild(list: any): void {
    for (let child in list) {
      list[child].children = [];
      this.checkChildNode(list[child], list[child]);
    }
  }

  private xmlToJsonService(data): void {
    let obj: any = {
      controllerId: this.schedulerIds.selected,
      objectType: this.objectType,
      configuration: data
    };
    if (this.objectType !== 'NOTIFICATION') {
      obj.schemaIdentifier = this.schemaIdentifier;
    }
    this.coreService.post('xmleditor/xml2json', obj).subscribe({
      next: (res: any) => {
        this.validConfig = false;
        this.extraInfo.deployed = false;
        let _tempArrToExpand = [];
        let arr = JSON.parse(res.configurationJson);
        let a = [arr];
        this.counting = arr.lastUuid;
        this.doc = new DOMParser().parseFromString(this.path, 'application/xml');
        this.addKey(a);
        this.nodes = a;
        this.handleNodeToExpandAtOnce(this.nodes, _tempArrToExpand);
        this.selectedNode = this.nodes[0];
        this.getIndividualData(this.selectedNode, undefined);
        this.selectedNodeDoc = this.checkText(this.nodes[0]);
        this.isLoading = false;
        this.submitXsd = true;
        this.isChange = true;
        this.prevXML = '';
        if (_tempArrToExpand && _tempArrToExpand.length > 0) {
          setTimeout(() => {
            for (const i in _tempArrToExpand) {
              _tempArrToExpand[i].expanded = true;
              delete _tempArrToExpand[i].loading;
            }
            this.nodes = [...this.nodes];
            this.storeXML(this.activeTab);
          }, 0);
        } else {
          this.storeXML(this.activeTab);
        }
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  private openXMLDialog(data): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ShowModalComponent,
      nzClassName: 'lg script-editor',
      nzData: {
        xml: data.configuration,
        schedulerId: this.schedulerIds.selected,
        objectType: this.objectType,
        tabSize: this.preferences.tabSize,
        schemaIdentifier: this.schemaIdentifier,
        activeTab: this.activeTab,
        validation: data.validation
      },
      nzFooter: null,
      nzClosable: false
    });
    modal.afterClose.subscribe(() => {
      this.toasterService.clear();
    });
  }

  private newConf(auditLog?): void {
    const obj: any = {
      objectType: this.objectType,
    };
    if (this.mainXml) {
      obj.configuration = this.mainXml;
    }
    if (this.objectType !== 'NOTIFICATION') {
      obj.controllerId = this.schedulerIds.selected;
    }
    this.coreService.post(this.objectType === 'NOTIFICATION' ? 'notification' : 'xmleditor/read', obj).subscribe({
      next: (res: any) => {
        if (res.validation && res.validation.validated) {
          this.validConfig = true;
        } else {
          if (res.configuration && res.configuration.validation && res.configuration.validation.validated) {
            this.validConfig = true;
          }
        }
        this.schemaIdentifier = res.schemaIdentifier;
        if (res.schema) {
          this.path = res.schema;
          this.loadTree(res.schema, false);
          this.submitXsd = true;
          this.isChange = true;
          this.extraInfo = {
            released: res.released,
            state: res.state,
            configurationDate: res.configurationDate,
            hasReleases: res.hasReleases,
            modified: res.modified
          };
          this.prevXML = '';
          this.storeXML(null, false, auditLog);
        }
      }, error: (err) => {
        this.submitXsd = false;
        this.isLoading = false;
        this.error = true;
        this.extraInfo = {};
        this.showErrorToast(err.data.error.message, '');
      }
    });
  }

  private validateSer(flag = true): void {
    this.mainXml = this._showXml();
    if (!this.mainXml) {
      return;
    }
    const obj: any = {
      controllerId: this.schedulerIds.selected,
      objectType: this.objectType,
      configuration: this.mainXml
    };
    if (this.objectType !== 'NOTIFICATION') {
      obj.schemaIdentifier = this.schemaIdentifier;
    }
    this.coreService.post('xmleditor/validate', obj).subscribe({
      next: (res: any) => {
        if (res.validationError) {
          if(flag) {
            this.showError(res.validationError);
          }
          this.validConfig = false;
        } else {
          this.validConfig = true;
        }
      }, error: (error) => {
        this.validConfig = false;
        if (flag && error && error.error) {
          this.showErrorToast(error.error.message, '');
        }
      }
    });
  }

  private _showXml(json = this.nodes, flag = false): any {
    const xml = this.jsonToXml(json);
    if (xml) {
      const xmlAsString = new XMLSerializer().serializeToString(xml);
      let a = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>`;
      a = a.concat(xmlAsString);
      if (flag) {
        let formatedXml = xmlFormat(a);
        formatedXml = formatedXml.replace(/>\s*(<!\[CDATA\[)/g, '>$1');
        formatedXml = formatedXml.replace(/]]>\s*<\//g, ']]></');
        return formatedXml;
      } else {
        return a;
      }
    } else {
      return null;
    }
  }

  private showErrorToast(msg: string, title: string): void {
    this.toasterService.error(msg, title).onTap
      .pipe(take(1))
      .subscribe(() => this.gotoErrorLocation());
  }
}
