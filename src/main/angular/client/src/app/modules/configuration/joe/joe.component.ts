import { HttpClient } from '@angular/common/http';
import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {AuthService} from '../../../components/guard';
import * as moment from 'moment';
import * as _ from 'underscore';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FileUploader } from 'ng2-file-upload';
import { ToasterService } from 'angular2-toaster';

declare const $;
@Component({
  selector: 'app-deploy-draft-modal',
  templateUrl: './deploy-dialog.html'
})
export class DeployComponent implements OnInit {
  @ViewChild('treeCtrl', {static: false}) treeCtrl;
  @Input() schedulerIds;
  @Input() preferences;
  selectedSchedulerIds = [];
  deployables:any = [{recursivelyDeploy: false, children: []}];
  isRecursive = true;
  path;
  update: any = [];
  delete: any = [];
  // tslint:disable-next-line: max-line-length
  constructor(public activeModal: NgbActiveModal, private http: HttpClient, private toasterService: ToasterService ,private authService: AuthService, private coreService: CoreService) {
  }

  ngOnInit() {
    this.buildDeployablesTree();
  }

  deploy() {
    const ids = [];
    this.selectedSchedulerIds.forEach(element => {
      ids.push({jobschedulerId: element});
    });
    const obj = {
      schedulers: ids,
      update: this.update,
      delete: this.delete
    };
    this.http.post('/publish/deploy', obj).subscribe((res: any) => {
      this.activeModal.close('ok');
    }, (error) => {
      this.toasterService.pop('error', error.code, error.message);
    });
  }

  createPath(data, path, action) {
    path = path + data.name + '/';
    const z = this.getParent(data);
    if (z.name || z.path) {
      this.createPath(z, path, action);
    } else {
      const x = path.split('/');
      let str = '';
      for (let i = x.length - 1; i >= 0; i--) {
        if (x[i] && x[i] !== '') {
          str += '/' + x[i];
        }
      }
      if (action === 'update') {
        this.update.push(_.clone(str));
      }
    }
  }

  deletePath(data, path, action) {
    path = path + data.name + '/';
    const z = this.getParent(data);
    if (z.name || z.path) {
      this.deletePath(z, path, action);
    } else {
      const x = path.split('/');
      let str = '';
      for (let i = x.length - 1; i >= 0; i--) {
        if (x[i] && x[i] !== '') {
          str += '/' + x[i];
        }
      }
      if (action === 'update') {
        for (let i = 0; i < this.update.length; i++) {
          if (str === this.update[i]) {
            this.update.splice(i, 1);
          }
        }
      }
    }
  }

  checkRecursiveOrder(node) {
    if (this.isRecursive && node.recursivelyDeploy) {
      this.handleRecursivelyRecursion(node);
    } else if (this.isRecursive && !node.recursivelyDeploy) {
      this.unCheckedHandleRecursivelyRecursion(node);
    } else if (!this.isRecursive && node.recursivelyDeploy && !node.type) {
      this.handleUnRecursively(node);
    } else if (!this.isRecursive && !node.recursivelyDeploy && !node.type) {
      this.unCheckedHandleUnRecursively(node);
    } else if (!this.isRecursive && !node.recursivelyDeploy && node.type) {
      this.uncheckedParentFolder(node);
      this.path = '';
      this.deletePath(node, this.path, node.action);
    } else if (!this.isRecursive && node.recursivelyDeploy && node.type) {
      this.path = '';
      this.createPath(node, this.path, node.action);
    }
  }

  uncheckedParentFolder(node) {
    this.treeCtrl.treeModel.setFocusedNode(node);
    const a = this.treeCtrl.treeModel.getFocusedNode().parent.data;
    this.getParent(a).recursivelyDeploy = false;
  }

  getParent(node) {
    this.treeCtrl.treeModel.setFocusedNode(node);
    if (this.treeCtrl.treeModel.getFocusedNode().parent) {
      const a = this.treeCtrl.treeModel.getFocusedNode().parent.data;
      return a;
    } else {
      return undefined;
    }
  }

  handleUnRecursively(data: any) {
    for (let i = 0; i < data.children.length; i++) {
      for (let index = 0; index < data.children[i].children.length; index++) {
        if (data.children[i].children[index].type) {
          data.children[i].children[index].recursivelyDeploy = true;
          this.path = '';
          this.createPath(data.children[i].children[index], this.path, data.children[i].children[index].action)
        }
      }
    }
  }

  unCheckedHandleUnRecursively(data: any) {
    for (let i = 0; i < data.children.length; i++) {
      for (let index = 0; index < data.children[i].children.length; index++) {
        data.children[i].children[index].recursivelyDeploy = false;
        this.path = '';
        this.deletePath(data.children[i].children[index], this.path, data.children[i].children[index].action)
      }
    }
  }

  handleRecursivelyRecursion(data) {
    if (data.object && data.children && data.children.length > 0) {
      for (let index = 0; index < data.children.length; index++) {
        data.children[index].recursivelyDeploy = true;
        this.path= '';
        this.createPath(data.children[index], this.path, data.children[index].action);

      }
    } else if (!data.object && !data.type) {
      data.recursivelyDeploy = true;
      if (data.children && data.children.length > 0) {
        for (let j = 0; j <data.children.length; j++) {
          this.handleRecursivelyRecursion(data.children[j]);
        }
      }
    }
  }

  unCheckedHandleRecursivelyRecursion(data) {
    if (data.object && data.children && data.children.length > 0) {
      for (let index = 0; index < data.children.length; index++) {
        data.children[index].recursivelyDeploy = false;
        this.path = '';
        this.deletePath(data.children[index], this.path, data.children[index].action)
      }
    } else if (!data.object && !data.type) {
      data.recursivelyDeploy = false;
      if (data.children && data.children.length > 0) {
        for (let j = 0; j <data.children.length; j++) {
          this.unCheckedHandleRecursivelyRecursion(data.children[j]);
        }
      }
    }
  }

  expandAll(): void {
    this.treeCtrl.treeModel.expandAll();
  }

  // Collapse all Node
  collapseAll(): void {
    this.treeCtrl.treeModel.collapseAll();
  }


  buildDeployablesTree() {
    this.deployables[0].children = [
      {
        name: 'Workflows', path: '/Workflows', object: 'WORKFLOW', isExpanded: true, children: [
          {
            name: 'w1', type: 'WORKFLOW', isSigned: true
          }
        ]
      }, {
        name: 'Job Classes', path: '/JobClasses', object: 'JOBCLASS', isExpanded: true, children: [
          {
            name: 'j_c1', type: 'JOBCLASS', isSigned: false
          }, {
            name: 'j_c2', type: 'JOBCLASS', isSigned: true
          }
        ]
      }, {
        name: 'Junctions', path: '/Junctions', object: 'JUNCTION', isExpanded: true, children: [
          {
            name: 'j1', type: 'JUNCTION'
          }, {
            name: 'j2', type: 'JUNCTION'
          }
        ]
      }, {
        name: 'Orders', path: '/Orders', object: 'ORDER', isExpanded: true, children: [
          {
            name: 'order_1', type: 'ORDER', isSigned: false
          }
        ]
      }, {
        name: 'Agent Clusters', path: '/Agent_Clusters', object: 'AGENTCLUSTER', isExpanded: true, children: [
          {
            name: 'agent_1', type: 'AGENTCLUSTER', isSigned: false
          }
        ]
      },
      {name: 'Locks', object: 'LOCK', children: []},
      {
        name: 'Calendars', path: '/Calendars', object: 'CALENDAR', children: []
      }, {
        name: 'sos', path: '/sos', children: [
          {
            name: 'Workflows', path: '/sos/Workflows', object: 'WORKFLOW', isExpanded: true, children: [
              {
                name: 'w1', type: 'WORKFLOW', isSigned: true
              }
            ]
          }
        ],
      }
    ];
  }

  cancel() {
    this.activeModal.dismiss();
  }
}

@Component({
  selector: 'app-set-version-modal',
  templateUrl: './setVersion-dialog.html'
})
export class SetVersionComponent implements OnInit {
  @ViewChild('treeCtrl', {static: false}) treeCtrl;
  @Input() preferences;
  deployables = [{children: []}];
  version = {type: 'setOneVersion', name: ''};
  isRecursive = true;
  path;
  delete: any = []
  update: any = [];
  prevVersion;
  // tslint:disable-next-line: max-line-length
  constructor(public activeModal: NgbActiveModal, private http: HttpClient, private authService: AuthService, private coreService: CoreService) {
  }

  ngOnInit() {
    this.buildDeployablesTree();
  }

  setVersion() {
    if (this.update.length > 0) {
      const obj: any = {
        jsObjects: this.update
      };
      if (this.version.type === 'setSeparateVersion') {
        this.http.post('publish/set_versions', obj).subscribe((res: any) => {
          this.activeModal.close('ok');
        }, (error) => {

        });
      } else {
        obj.version = this.version.name;
        this.http.post('publish/set_version', obj).subscribe((res: any) => {
          this.activeModal.close('ok');
        }, (error) => {

        });
      }
    } else {
      console.log('add Version');

    }
  }

  cancelSetVersion(data) {
    if (this.prevVersion) {
      data.version = _.clone(this.prevVersion);
    }
    this.prevVersion = undefined;
    data.setVersion = false;
  }

  deleteSetVersion(data) {
    this.path = '';
    this.deletePath(data, this.path, this.version.type);
    delete data['version'];
  }

  editVersion(data) {
    if (data.version) {
      this.prevVersion = _.clone(data.version);
    }
  }

  applySetVersion(data) {
    this.path = '';
    this.createPath(data, this.path, this.version.type, data.version);
    data.setVersion = false;
  }

  createPath(data, path, action, version) {
    path = path + data.name + '/';
    const z = this.getParent(data);
    if (z.name || z.path) {
      this.createPath(z, path, action, version);
    } else {
      const x = path.split('/');
      let str = '';
      for (let i = x.length - 1; i >= 0; i--) {
        if (x[i] && x[i] !== '') {
          str += '/' + x[i];
        }
      }
      if (action === 'setSeparateVersion') {
        const obj = {
          version: version,
          path: _.clone(str)
        };
        this.update.push(obj);
      } else {
        this.update.push(_.clone(str));
      }
    }
    console.log(this.update);

  }

  deletePath(data, path, action) {
    path = path + data.name + '/';
    const z = this.getParent(data);
    if (z.name || z.path) {
      this.deletePath(z, path, action);
    } else {
      const x = path.split('/');
      let str = '';
      for (let i = x.length - 1; i >= 0; i--) {
        if (x[i] && x[i] !== '') {
          str += '/' + x[i];
        }
      }
      if (action === 'setSeparateVersion') {
        for (let i = 0; i < this.update.length; i++) {
          if (str === this.update[i].path) {
            this.update.splice(i, 1);
          }
        }
      }
    }
  }

  checkRecursiveOrder(node) {
    if (this.isRecursive && node.recursivelyDeploy) {
      this.handleRecursivelyRecursion(node);
    } else if (this.isRecursive && !node.recursivelyDeploy) {
      this.unCheckedHandleRecursivelyRecursion(node);
    } else if (!this.isRecursive && node.recursivelyDeploy && !node.type) {
      this.handleUnRecursively(node);
    } else if (!this.isRecursive && !node.recursivelyDeploy && !node.type) {
      this.unCheckedHandleUnRecursively(node);
    } else if (!this.isRecursive && !node.recursivelyDeploy && node.type) {
      this.uncheckedParentFolder(node);
      this.path = '';
      this.deletePath(node, this.path, node.action);
    } else if (!this.isRecursive && node.recursivelyDeploy && node.type) {
      this.path = '';
      this.createPath(node, this.path, node.action, undefined);
    }
  }

  uncheckedParentFolder(node) {
    this.treeCtrl.treeModel.setFocusedNode(node);
    const a = this.treeCtrl.treeModel.getFocusedNode().parent.data;
    this.getParent(a).recursivelyDeploy = false;
  }

  getParent(node) {
    this.treeCtrl.treeModel.setFocusedNode(node);
    if (this.treeCtrl.treeModel.getFocusedNode().parent) {
      const a = this.treeCtrl.treeModel.getFocusedNode().parent.data;
      return a;
    } else {
      return undefined;
    }
  }

  handleUnRecursively(data: any) {
    for (let i = 0; i < data.children.length; i++) {
      for (let index = 0; index < data.children[i].children.length; index++) {
        if (data.children[i].children[index].type) {
          data.children[i].children[index].recursivelyDeploy = true;
          this.path = '';
          this.createPath(data.children[i].children[index], this.path, data.children[i].children[index].action, undefined)
        }
      }
    }
  }

  unCheckedHandleUnRecursively(data: any) {
    for (let i = 0; i < data.children.length; i++) {
      for (let index = 0; index < data.children[i].children.length; index++) {
        data.children[i].children[index].recursivelyDeploy = false;
        this.path = '';
        this.deletePath(data.children[i].children[index], this.path, data.children[i].children[index].action)
      }
    }
  }

  handleRecursivelyRecursion(data) {
    if (data.object && data.children && data.children.length > 0) {
      for (let index = 0; index < data.children.length; index++) {
        data.children[index].recursivelyDeploy = true;
        this.path= '';
        this.createPath(data.children[index], this.path, data.children[index].action, undefined);
      }
    } else if (!data.object && !data.type) {
      data.recursivelyDeploy = true;
      if (data.children && data.children.length > 0) {
        for (let j = 0; j <data.children.length; j++) {
          this.handleRecursivelyRecursion(data.children[j]);
        }
      }
    }
  }

  unCheckedHandleRecursivelyRecursion(data) {
    if (data.object && data.children && data.children.length > 0) {
      for (let index = 0; index < data.children.length; index++) {
        data.children[index].recursivelyDeploy = false;
        this.path = '';
        this.deletePath(data.children[index], this.path, data.children[index].action);
      }
    } else if (!data.object && !data.type) {
      data.recursivelyDeploy = false;
      if (data.children && data.children.length > 0) {
        for (let j = 0; j < data.children.length; j++) {
          this.unCheckedHandleRecursivelyRecursion(data.children[j]);
        }
      }
    }
  }

  setIndividualVersion(data) {
    data.setVersion = true;
  }

  expandAll(): void {
    this.treeCtrl.treeModel.expandAll();
  }

  // Collapse all Node
  collapseAll(): void {
    this.treeCtrl.treeModel.collapseAll();
  }

  onNodeSelected(e: Event) {

  }

  buildDeployablesTree() {
    this.deployables[0].children = [
      {
        name: 'Workflows', path: '/Workflows', object: 'WORKFLOW', isExpanded: true, children: [
          {
            name: 'w1', type: 'WORKFLOW', isSigned: true
          }
        ]
      }, {
        name: 'Job Classes', path: '/JobClasses', object: 'JOBCLASS', isExpanded: true, children: [
          {
            name: 'j_c1', type: 'JOBCLASS', isSigned: false
          }, {
            name: 'j_c2', type: 'JOBCLASS', isSigned: true
          }
        ]
      }, {
        name: 'Junctions', path: '/Junctions', object: 'JUNCTION', isExpanded: true, children: [
          {
            name: 'j1', type: 'JUNCTION'
          }, {
            name: 'j2', type: 'JUNCTION'
          }
        ]
      }, {
        name: 'Orders', path: '/Orders', object: 'ORDER', isExpanded: true, children: [
          {
            name: 'order_1', type: 'ORDER', isSigned: false
          }
        ]
      }, {
        name: 'Agent Clusters', path: '/Agent_Clusters', object: 'AGENTCLUSTER', isExpanded: true, children: [
          {
            name: 'agent_1', type: 'AGENTCLUSTER', isSigned: false
          }
        ]
      },
      {name: 'Locks', object: 'LOCK', children: []},
      {
        name: 'Calendars', path: '/Calendars', object: 'CALENDAR', children: []
      }, {
        name: 'sos', path: '/sos', children: [
          {
            name: 'Workflows', path: '/sos/Workflows', object: 'WORKFLOW', isExpanded: true, children: [
              {
                name: 'w1', type: 'WORKFLOW', isSigned: true
              }
            ]
          }
        ],
      }
    ];
  }

  cancel() {
    this.activeModal.dismiss();
  }
}

@Component({
  selector: 'app-export-modal',
  templateUrl: './export-dialog.html'
})
export class ExportComponent implements OnInit {
  @ViewChild('treeCtrl', {static: false}) treeCtrl;
  @Input() schedulerIds;
  @Input() preferences;
  selectedSchedulerIds = [];
  deployables = [{children: []}];
  isRecursive = false;
  showUnSigned = true;
  showSigned = true;
  // tslint:disable-next-line: max-line-length
  constructor(public activeModal: NgbActiveModal, private authService: AuthService, private coreService: CoreService) {
  }

  ngOnInit() {
    this.buildDeployablesTree();
  }

  export() {

  }

  changeRecursiveOrder() {
    this.isRecursive = !this.isRecursive;
  }

  expandAll(): void {
    this.treeCtrl.treeModel.expandAll();
  }

  // Collapse all Node
  collapseAll(): void {
    this.treeCtrl.treeModel.collapseAll();
  }

  onNodeSelected(e: Event) {

  }

  toggleExpanded(e: Event) {

  }


  buildDeployablesTree() {
    this.deployables[0].children = [
      {
        name: 'Workflows', path: '/Workflows', object: 'WORKFLOW', isExpanded: true, children: [
          {
            name: 'w1', type: 'WORKFLOW', isSigned: true
          }
        ]
      }, {
        name: 'Job Classes', path: '/JobClasses', object: 'JOBCLASS', isExpanded: true, children: [
          {
            name: 'j_c1', type: 'JOBCLASS', isSigned: false
          }, {
            name: 'j_c2', type: 'JOBCLASS', isSigned: true
          }
        ]
      }, {
        name: 'Junctions', path: '/Junctions', object: 'JUNCTION', isExpanded: true, children: [
          {
            name: 'j1', type: 'JUNCTION'
          }, {
            name: 'j2', type: 'JUNCTION'
          }
        ]
      }, {
        name: 'Orders', path: '/Orders', object: 'ORDER', isExpanded: true, children: [
          {
            name: 'order_1', type: 'ORDER', isSigned: false
          }
        ]
      }, {
        name: 'Agent Clusters', path: '/Agent_Clusters', object: 'AGENTCLUSTER', isExpanded: true, children: [
          {
            name: 'agent_1', type: 'AGENTCLUSTER', isSigned: false
          }
        ]
      },
      {name: 'Locks', object: 'LOCK', children: []},
      {
        name: 'Calendars', path: '/Calendars', object: 'CALENDAR', children: []
      }, {
        name: 'sos', path: '/sos', children: [
          {
            name: 'Workflows', path: '/sos/Workflows', object: 'WORKFLOW', isExpanded: true, children: [
              {
                name: 'w1', type: 'WORKFLOW', isSigned: true
              }
            ]
          }
        ],
      }
    ];
  }

  cancel() {
    this.activeModal.dismiss();
  }
}

@Component({
  selector: 'app-import-modal-content',
  templateUrl: './import-dialog.html'
})
export class ImportWorkflowModalComponent implements OnInit {
  uploader: FileUploader;
  fileLoading = false;
  messageList: any;
  required = false;
  submitted = false;
  comments: any = {};
  uploadData: any;
  constructor(
    public activeModal: NgbActiveModal,
    public modalService: NgbModal,
    public toasterService: ToasterService,
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

  // submit data
  onSubmit() {
    this.activeModal.close({uploadData: this.uploadData});
  }

  cancel() {
    this.activeModal.close('');
  }
}

@Component({
  selector: 'app-preview-calendar-template',
  template: '<div id="full-calendar"></div>',
})
export class PreviewCalendarComponent implements OnInit, OnDestroy {
  @Input() schedulerId: any;
  calendar: any;
  planItems = [];
  tempList = [];
  calendarTitle: number;
  toDate: any;
  subscription: Subscription;

  constructor(private coreService: CoreService, private dataService: DataService) {
    this.calendarTitle = new Date().getFullYear();
  }

  ngOnInit(): void {
    $('#full-calendar').calendar({
      renderEnd: (e) => {
        this.calendarTitle = e.currentYear;
        this.changeDate();
      }
    });
    this.subscription = this.dataService.isCalendarReload.subscribe(res => {
      this.calendar = res;
      this.init();
    });
  }

  init() {
    let obj = {
      jobschedulerId: this.schedulerId,
      dateFrom: this.calendar.from || moment().format('YYYY-MM-DD'),
      dateTo: this.calendar.to,
      path: this.calendar.path
    };
    this.toDate = _.clone(obj.dateTo);
    if (new Date(obj.dateTo).getTime() > new Date(this.calendarTitle + '-12-31').getTime()) {
      obj.dateTo = this.calendarTitle + '-12-31';
    }
    this.getDates(obj, true);
  }

  changeDate() {
    let newDate = new Date();
    newDate.setHours(0, 0, 0, 0);
    let toDate: any;
    if (new Date(this.toDate).getTime() > new Date(this.calendarTitle + '-12-31').getTime()) {
      toDate = this.calendarTitle + '-12-31';
    } else {
      toDate = this.toDate;
    }

    if (newDate.getFullYear() < this.calendarTitle && (new Date(this.calendarTitle + '-01-01').getTime() < new Date(toDate).getTime())) {
      let obj = {
        jobschedulerId: this.schedulerId,
        dateFrom: this.calendarTitle + '-01-01',
        dateTo: toDate,
        path: this.calendar.path
      };
      this.getDates(obj, false);
    } else if (newDate.getFullYear() === this.calendarTitle) {
      this.planItems = _.clone(this.tempList);
      if ($('#full-calendar').data('calendar')) {
        $('#full-calendar').data('calendar').setDataSource(this.planItems);
      }
    }
  }

  private getDates(obj, flag: boolean): void {
    this.planItems = [];
    this.coreService.post('calendar/dates', obj).subscribe((result: any) => {
      for (let i = 0; i < result.dates.length; i++) {
        let x = result.dates[i];
        let obj = {
          startDate: moment(x),
          endDate: moment(x),
          color: '#007da6'
        };

        this.planItems.push(obj);
      }
      for (let i = 0; i < result.withExcludes.length; i++) {
        let x = result.withExcludes[i];
        this.planItems.push({
          startDate: moment(x),
          endDate: moment(x),
          color: '#eb8814'
        });
      }
      if (flag) {
        this.tempList = _.clone(this.planItems);
      }
      $('#full-calendar').data('calendar').setDataSource(this.planItems);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}


@Component({
  selector: 'app-joe',
  templateUrl: './joe.component.html',
  styleUrls: ['./joe.component.scss']
})
export class JoeComponent implements OnInit, OnDestroy {
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  tree: any = [];
  isLoading = true;
  pageView: any = 'grid';
  options: any = {};
  data: any = {};
  selectedPath: string;
  type: string;

  @ViewChild('treeCtrl', {static: false}) treeCtrl;

  constructor(
    private authService: AuthService,
    public coreService: CoreService,
    private dataService: DataService,
    public modalService: NgbModal) {
  }

  ngOnInit() {
    if (sessionStorage.preferences) {
      this.permission = JSON.parse(this.authService.permission) || {};
    }
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);

    this.initTree();
  }

  ngOnDestroy() {
    this.coreService.tabs._configuration.state = 'inventory';
  }

  initTree() {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerIds.selected,
      compact: true,
      types: ['WORKFLOW']
    }).subscribe((res) => {
      this.tree = this.coreService.prepareTree(res);
      if (this.tree.length > 0) {
        this.updateObjects(this.tree[0], () => {

        }, true);
      }
      const interval = setInterval(() => {
        if (this.treeCtrl && this.treeCtrl.treeModel) {
          const node = this.treeCtrl.treeModel.getNodeById(1);
          if (node) {
            node.expand();
            node.data.isSelected = true;
            this.selectedPath = node.data.path;
          }
          clearInterval(interval);
        }
      }, 5);
      this.isLoading = false;
    }, () => this.isLoading = false);
  }

  expandAll(): void {
    this.treeCtrl.treeModel.expandAll();
  }

  // Collapse all Node
  collapseAll(): void {
    this.treeCtrl.treeModel.collapseAll();
  }

  navFullTree() {
    const self = this;
    this.tree.forEach((value) => {
      value.isSelected = false;
      traverseTree(value);
    });

    function traverseTree(data) {
      if (data.children) {
        data.children.forEach((value) => {
          value.isSelected = false;
          traverseTree(value);
        });
      }
    }
  }

  onNodeSelected(e): void {
    if (e.node.data.type || e.node.data.object) {
      this.navFullTree();
      if (this.preferences.expandOption === 'both') {
        const someNode = this.treeCtrl.treeModel.getNodeById(e.node.data.id);
        someNode.expand();
      }
      this.selectedPath = e.node.data.path;
      e.node.data.isSelected = true;
      this.data = e.node.data;
      this.type = e.node.data.object || e.node.data.type;
      if (this.type === 'WORKFLOW') {
        this.dataService.isWorkFlowReload.next(true);
      }
    }
  }

  toggleExpanded(e): void {
    e.node.data.isExpanded = e.isExpanded;
  }

  updateObjects(data, cb, isExpandConfiguration) {
    let flag = true, arr = [];
    if (!data.children) {
      data.children = [];
    } else if(data.children.length > 0){
      if (data.children[0].configuration) {
        flag = false;
        arr = data.children[0].children;
      }
    }
    if (flag) {
      arr = [{
        name: 'Workflows', object: 'WORKFLOW', children: [{
          name: 'w1', type: 'WORKFLOW', path: data.path
        }], parent: data.path
      },
        {
          name: 'Job Classes', object: 'JOBCLASS', children: [{
            name: 'j-c_1', type: 'JOBCLASS', path: data.path
          }], parent: data.path
        },
        {
          name: 'Junctions', object: 'JUNCTION', children: [{
            name: 'j1', type: 'JUNCTION', path: data.path
          }, {
            name: 'j2', type: 'JUNCTION', path: data.path
          }], parent: data.path
        },
        {
          name: 'Orders', object: 'ORDER', children: [{
            name: 'order_1', type: 'ORDER', path: data.path
          }], parent: data.path
        },
        {
          name: 'Agent Clusters', object: 'AGENTCLUSTER', children: [{
            name: 'agent_1', type: 'AGENTCLUSTER', path: data.path
          }], parent: data.path
        },
        {name: 'Locks', object: 'LOCK', children: [], parent: data.path},
        {name: 'Calendars', object: 'CALENDAR', children: [], parent: data.path}];
      data.children.splice(0, 0, {
        name: 'Configuration',
        configuration: 'CONFIGURATION',
        children: arr,
        parent: data.path
      });
    }
    if (this.preferences.joeExpandOption === 'both' || isExpandConfiguration) {
      data.children[0].expanded = true;
    }
  }

  deployDraft() {
    const modalRef = this.modalService.open(DeployComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.schedulerIds = this.schedulerIds;
    modalRef.componentInstance.preferences = this.preferences;
    modalRef.result.then((res: any) => {

    }, () => {

    });
  }

  export() {
    const modalRef = this.modalService.open(ExportComponent, {backdrop: 'static', size: 'lg'});
    modalRef.result.then((res: any) => {

    }, () => {

    });
  }

  import() {
    const modalRef = this.modalService.open(ImportWorkflowModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.result.then((res: any) => {

    }, () => {

    });
  }

  setVersion() {
    const modalRef = this.modalService.open(SetVersionComponent, {backdrop: 'static', size: 'lg'});
    modalRef.result.then((res: any) => {

    }, () => {

    });
  }

  createFolder(node) {

  }

  newObject(node, type) {

  }

  deployObject(node) {

  }

  copy(node, e) {

  }

  paste(node, e) {

  }

  removeObject(node, e) {

  }

  removeDraft(node, e) {

  }

  restoreObject(node, e) {

  }

  receiveMessage($event) {
    this.pageView = $event;
  }
}
