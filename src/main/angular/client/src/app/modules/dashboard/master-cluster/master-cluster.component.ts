import {Component, OnInit, OnDestroy, Input, ElementRef} from '@angular/core';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {Subscription} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {CommentModalComponent} from '../action/action.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {saveAs} from 'file-saver';

import * as _ from 'underscore';
import * as moment from 'moment';

declare const $;


@Component({
  selector: 'app-master-cluster',
  templateUrl: './master-cluster.component.html'
})
export class MasterClusterComponent implements OnInit, OnDestroy {
  @Input('sizeY') ybody: number;
  @Input() permission: any;
  isLoaded = false;
  rWidth = 200;
  tWidth = 0;
  rHeight = 130;
  margin = 35;
  vMargin = 70;
  mLeft = 0;
  top = 0;
  clusterStatusData: any;
  supervisedMasters = [];
  preferences: any = {};
  schedulerIds: any = {};
  lastId: any;
  template = '';
  subscription: Subscription;
  selectedJobScheduler: any = {};

  interval: any;

  constructor(private authService: AuthService, public coreService: CoreService, private dataService: DataService,
              private elementRef: ElementRef, private translate: TranslateService, public modalService: NgbModal) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refreshEvent(res);
    });
  }

  private refreshEvent(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId === this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args[i].eventSnapshots[j].eventType === 'SchedulerStateChanged') {
              this.isLoaded = false;
              this.getClusterStatusData(true);
              break;
            }
          }
        }
        break;
      }
    }
  }

  ngOnInit() {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    this.getSelectedSchedulerInfo();

    this.getClusterStatusData(false);
  }

  ngOnDestroy() {
    $('[data-toggle=\'popover\']').popover('hide');
    this.subscription.unsubscribe();
    clearInterval(this.interval);
  }

  getSelectedSchedulerInfo() {
    if (sessionStorage.$SOS$JOBSCHEDULE && JSON.parse(sessionStorage.$SOS$JOBSCHEDULE)) {
      this.selectedJobScheduler = JSON.parse(sessionStorage.$SOS$JOBSCHEDULE) || {};
    }
    if (_.isEmpty(this.selectedJobScheduler)) {
      const interval = setInterval(() => {
        if (sessionStorage.$SOS$JOBSCHEDULE && JSON.parse(sessionStorage.$SOS$JOBSCHEDULE)) {
          this.selectedJobScheduler = JSON.parse(sessionStorage.$SOS$JOBSCHEDULE) || {};
          console.log(this.selectedJobScheduler);
          if (!_.isEmpty(this.selectedJobScheduler)) {
            clearInterval(interval);
          }
        }
      }, 100);
    }
  }

  getClusterStatusData(flag: boolean): void {
    let obj = {
      database: {},
      members: {}
    };

    this.coreService.post('jobscheduler/db', {jobschedulerId: this.schedulerIds.selected}).subscribe(res => {
      obj.database = res;
      this.coreService.post('jobscheduler/cluster/members/p', {jobschedulerId: this.schedulerIds.selected}).subscribe(res => {
        obj.members = res;
        if (flag) {
          this.refresh();
        } else {
          this.prepareDataObj(obj);
        }
        this.isLoaded = true;

      }, (err) => {
        this.isLoaded = true;

      });
    }, (err) => {
      this.isLoaded = true;
    });
  }

  private getSupervisorDetails(): any {
    return this.coreService.post('jobscheduler/supervisor/p', {jobschedulerId: this.schedulerIds.selected});
  }

  private onRefresh(): any {
    return this.coreService.post('jobscheduler/cluster/members', {jobschedulerId: this.schedulerIds.selected});
  }

  private prepareDataObj(obj) {
    this.clusterStatusData = obj;
    this.init();
  }

  private init() {
    this.rWidth = 200;
    this.rHeight = 130;
    this.margin = 35;
    this.vMargin = 70;
    this.mLeft = 0;
    this.top = 0;
    this.supervisedMasters = [];
    this.lastId = '';
    this.template = '<div id="clusterStatusContainer">';
    this.prepareData();

  }

  private refresh() {
    $('#clusterStatusContainer').remove();
    if (this.clusterStatusData) {
      this.init();
    } else {
      let msg: any;
      this.translate.get('message.noDataAvailable').subscribe(translatedValue => {
        msg = translatedValue;
      });
      this.template = '<div id="clusterStatusContainer"><div style="top: 44%;left: 40%;" class="h6 text-u-c pos-abt">' + msg + '</div>';
      this.template = this.template + '</div>';
      this.loadComponent();
    }
  }

  private loadComponent() {
    let d1 = this.elementRef.nativeElement.querySelector('.clusterDiagram');
    d1.insertAdjacentHTML('beforeend', this.template);
  }

  private startToCheck() {
    const self = this;
    let count = 0;
    this.interval = setInterval(function () {
      self.drawConnections();
      self.setListeners();
      ++count;
      if (count === 30) {
        clearInterval(self.interval);
      }
    }, 200);
  }

  private setListeners() {
    const self = this;
    let offset: any;
    $('[data-toggle="popover"]').popover({html: true, trigger: 'hover'});
    $('.clusterDiagram').on('shown.bs.dropdown', function (e) {
      $('[data-toggle="popover"]').popover('hide');
      let p = $(e.target).find('.more-option');
      offset = p.offset();
      if (offset) {
        $('.cluster-dropdown').css({
          'left': (offset.left - 8) + 'px',
          'top': (offset.top + 19) - window.scrollY + 'px'
        });
        window.addEventListener('scroll', scroll, true);
      }

    });
    $('.clusterDiagram').on('hide.bs.dropdown', function (e) {
      offset = {};
      window.removeEventListener('scroll', scroll, true);
    });

    function scroll() {
      if (offset.top) {
        $('div.open .cluster-dropdown').css({top: (offset.top + 16) - window.scrollY + 'px'});
      }
    }

    let anchors: any = document.querySelectorAll('a[id^=\'__\']');
    for (let i = 0; i < anchors.length; i++) {
      anchors[i].addEventListener('click', function () {
        let obj: any = {}, data, results;
        const regExp = /__(.+)-(.+)-(\d+)-(\d+)/, regExp2 = /__(.+)-(.+)-(\d+)/;
        if (regExp.test(anchors[i].id)) {
          results = regExp.exec(anchors[i].id);
          if (results[4] !== '99') {
            data = self.clusterStatusData.supervisors[results[4]].masters[results[3]];
          } else {
            data = self.clusterStatusData.members.masters[results[3]];
          }
        } else if (regExp2.test(anchors[i].id)) {
          results = regExp2.exec(anchors[i].id);
          data = self.clusterStatusData.supervisors[results[3]];
        }
        obj.url = data.url;
        obj.jobschedulerId = data.jobschedulerId;
        self.clusterAction(results[2], obj);
      });
    }
  }

  private prepareData() {
    let supervisors = [];
    this.clusterStatusData.supervisors = this.clusterStatusData.supervisors || [];
    if (!this.clusterStatusData.members || !this.clusterStatusData.members.masters) {
      return;
    }

    this.startToCheck();
    const self = this;
    let labelState: any, status: any, terminateBtn: any, terminateWithinBtn: any, abortBtn: any,
      abortAndRestartBtn: any,
      terminateAndRestartBtn: any, terminateAndRestartWithinBtn: any, pauseBtn: any, continueBtn: any,
      removeInstanceBtn: any, downloadLogBtn: any, downloadDebugLogBtn: any, labelDatabase: any, labelArchitecture: any
      , labelDistribution: any, labelSurveyDate: any, labelVersion: any, labelStartedAt: any, labelUrl: any;

    self.translate.get('label.state').subscribe(translatedValue => {
      labelState = translatedValue;
    });
    self.translate.get('label.database').subscribe(translatedValue => {
      labelDatabase = translatedValue;
    });
    self.translate.get('button.terminate').subscribe(translatedValue => {
      terminateBtn = translatedValue;
    });
    self.translate.get('button.terminateWithin').subscribe(translatedValue => {
      terminateWithinBtn = translatedValue;
    });
    self.translate.get('button.abort').subscribe(translatedValue => {
      abortBtn = translatedValue;
    });
    self.translate.get('button.abortAndRestart').subscribe(translatedValue => {
      abortAndRestartBtn = translatedValue;
    });
    self.translate.get('button.terminateAndRestart').subscribe(translatedValue => {
      terminateAndRestartBtn = translatedValue;
    });
    self.translate.get('button.terminateAndRestartWithin').subscribe(translatedValue => {
      terminateAndRestartWithinBtn = translatedValue;
    });

    self.translate.get('button.pause').subscribe(translatedValue => {
      pauseBtn = translatedValue;
    });
    self.translate.get('button.continue').subscribe(translatedValue => {
      continueBtn = translatedValue;
    });
    self.translate.get('button.removeInstance').subscribe(translatedValue => {
      removeInstanceBtn = translatedValue;
    });
    self.translate.get('button.downloadLog').subscribe(translatedValue => {
      downloadLogBtn = translatedValue;
    });
    self.translate.get('button.downloadDebugLog').subscribe(translatedValue => {
      downloadDebugLogBtn = translatedValue;
    });
    self.translate.get('label.architecture').subscribe(translatedValue => {
      labelArchitecture = translatedValue;
    });
    self.translate.get('label.distribution').subscribe(translatedValue => {
      labelDistribution = translatedValue;
    });
    self.translate.get('label.surveyDate').subscribe(translatedValue => {
      labelSurveyDate = translatedValue;
    });
    self.translate.get('label.version').subscribe(translatedValue => {
      labelVersion = translatedValue;
    });
    self.translate.get('label.startedAt').subscribe(translatedValue => {
      labelStartedAt = translatedValue;
    });
    self.translate.get('label.url').subscribe(translatedValue => {
      labelUrl = translatedValue;
    });

    for (let i = 0; i < this.clusterStatusData.members.masters.length; i++) {
      if (!this.clusterStatusData.members.masters[i].supervisor) {
        removeSupervised();
        return;
      }

      self.supervisedMasters.push(i);
      let nMaster = {};
      if (supervisors.indexOf(this.clusterStatusData.members.masters[i].supervisor.jobschedulerId) >= 0) {
        self.clusterStatusData.supervisors[supervisors.indexOf(this.clusterStatusData.members.masters[i].supervisor.jobschedulerId)].masters.push(_.extend(this.clusterStatusData.members.masters[i], nMaster));
      } else {
        supervisors.push(this.clusterStatusData.members.masters[i].supervisor.jobschedulerId);
        let nSupervisor = this.clusterStatusData.members.masters[i].supervisor;
        nSupervisor.masters = [];
        nSupervisor.masters.push(_.extend(this.clusterStatusData.members.masters[i], nMaster));
        self.clusterStatusData.supervisors.push(nSupervisor);
      }

      if (i === this.clusterStatusData.members.masters.length - 1) {
        removeSupervised();
      }
    }

    function removeSupervised() {
      if (self.clusterStatusData.supervisors.length <= 0) {
        getTemporaryData(null);
      }
      for (let i = 0; i < self.supervisedMasters.length; i++) {
        self.clusterStatusData.members.masters.splice(self.supervisedMasters[i] - i, 1);
        if (i == self.supervisedMasters.length - 1) {
          getSupervisor(null);
        }
      }
    }

    function getSupervisor(refresh) {
      if (self.clusterStatusData.supervisors.length <= 0) {
        getTemporaryData(refresh);
      }
      for (let i = 0; i < self.clusterStatusData.supervisors.length; i++) {
        self.getSupervisorDetails().subscribe(res => {
          let result: any;
          self.coreService.post('jobscheduler/supervisor', {jobschedulerId: self.schedulerIds.selected}).subscribe(resV => {
            result = resV;
            res.jobscheduler.state = result.jobscheduler.state;
            res.jobscheduler.startedAt = result.jobscheduler.startedAt;
            self.clusterStatusData.supervisors[i].data = res;
            if (refresh) {
              refreshSupervisorState(self.clusterStatusData.supervisors[i]);
            }
            if (i === self.clusterStatusData.supervisors.length - 1) {
              getTemporaryData(refresh);
            }
          });
        });
      }
    }

    function getTemporaryData(refresh) {

      self.onRefresh().subscribe((res) => {
        if (self.clusterStatusData.supervisors.length <= 0) {
          getTemporaryData2(res, refresh);
        }
        for (let i = 0; i < self.clusterStatusData.supervisors.length; i++) {
          for (let j = 0; j < self.clusterStatusData.supervisors[i].masters.length; j++) {
            for (let x = 0; x < res.masters.length; x++) {
              if (res.masters[x].url === self.clusterStatusData.supervisors[i].masters[j].url) {
                self.clusterStatusData.supervisors[i].masters[j].state = res.masters[x].state;
                self.clusterStatusData.supervisors[i].masters[j].url = res.masters[x].url;
                self.clusterStatusData.supervisors[i].masters[j].startedAt = res.masters[x].startedAt;
                if (self.clusterStatusData.supervisors[i].masters[j].state && refresh) {
                  refreshMasterState(self.clusterStatusData.supervisors[i].masters[j]);
                }
              }
              if (self.clusterStatusData.supervisors.length - 1 === i && self.clusterStatusData.supervisors[i].masters.length - 1 === j && res.masters.length - 1 === x) {
                getTemporaryData2(res, refresh);
              }
            }
          }
        }

      }, () => {
        getTemporaryData2(null, refresh);
      });
    }

    function getTemporaryData2(res, refresh) {
      if ((self.clusterStatusData.members.masters.length === 0 && !refresh) || !res) {
        drawFlow();
      }

      if (res) {
        for (let i = 0; i < self.clusterStatusData.members.masters.length; i++) {
          for (let j = 0; j < res.masters.length; j++) {
            if (res.masters[j].url === self.clusterStatusData.members.masters[i].url) {
              self.clusterStatusData.members.masters[i].state = res.masters[j].state;
              self.clusterStatusData.members.masters[i].url = res.masters[j].url;
              self.clusterStatusData.members.masters[i].startedAt = res.masters[j].startedAt;
              if (self.clusterStatusData.members.masters[i].state && refresh) {
                refreshMasterState(self.clusterStatusData.members.masters[i]);
              }
            }
            if (self.clusterStatusData.members.masters.length - 1 === i && res.masters.length - 1 === j && !refresh) {
              drawFlow();
            }
          }

          if (refresh && (refresh.state === 'stopping' || refresh.state === 'starting') && res.masters.length === 0) {
            if (self.clusterStatusData.members.masters[i].state._text !== ' ') {
              self.clusterStatusData.members.masters[i].state._text = refresh.state;
              refreshMasterState(self.clusterStatusData.members.masters[i]);
            }
          }
        }
      }
    }

    function refreshMasterState(master) {

      let span = document.getElementById('sp' + master.url);
      let dState = document.getElementById('state' + master.url);
      if (dState) {
        dState.innerHTML = master.state._text;
      }
      if (master.state && span) {

      }
    }

    function refreshSupervisorState(supervisor) {
      if (supervisor.data.jobscheduler.state) {

      }
    }

    function drawFlow() {
      let sLeft = 0;
      self.top = self.vMargin;
      if (self.clusterStatusData.supervisors.length === 0) {
        drawFlowForRemainings(true);
      }
      for (let i = 0; i < self.clusterStatusData.supervisors.length; i++) {
        self.tWidth = self.rWidth * self.clusterStatusData.supervisors[i].masters.length + self.margin * (self.clusterStatusData.supervisors[i].masters.length - 1);
        sLeft = self.tWidth / 2 - self.rWidth / 2 + self.margin;
        if (i !== 0) {
          sLeft = sLeft + self.tWidth + self.margin;
        }

        let c = 'cluster-rect';
        if (new Date().getTime() - new Date(self.clusterStatusData.supervisors[i].data.jobscheduler.surveyDate).getTime() < 2000) {
          c = c + ' yellow-border';
        }

        let sClassRunning = 'text-success';

        if (self.clusterStatusData.supervisors[i].data.jobscheduler.state && self.clusterStatusData.supervisors[i].data.jobscheduler.state._text.toLowerCase() === 'stopped') {
          sClassRunning = 'text-danger';
        } else if (self.clusterStatusData.supervisors[i].data.jobscheduler.state && self.clusterStatusData.supervisors[i].data.jobscheduler.state._text.toLowerCase() === 'unreachable') {
          sClassRunning = 'text-danger1';
        } else if (!self.clusterStatusData.supervisors[i].data.jobscheduler.state || self.clusterStatusData.supervisors[i].data.jobscheduler.state._text.toLowerCase() !== 'running') {
          sClassRunning = 'text-warn';
        }

        let colorClass = 'text-warn', permissionClass = 'hide';

        if (self.clusterStatusData.supervisors[i].data.jobscheduler.state && self.clusterStatusData.supervisors[i].data.jobscheduler.state._text) {
          colorClass = self.clusterStatusData.supervisors[i].data.jobscheduler.state._text === 'RUNNING' ? 'text-success' : self.clusterStatusData.supervisors[i].data.jobscheduler.state._text === 'STOPPED' ? 'text-danger' :
            (self.clusterStatusData.supervisors[i].data.jobscheduler.state._text === 'STOPPING' || self.clusterStatusData.supervisors[i].data.jobscheduler.state._text === 'STARTING' || self.clusterStatusData.supervisors[i].data.jobscheduler.state._text === 'TERMINATING' || self.clusterStatusData.supervisors[i].data.jobscheduler.state._text === 'UNREACHABLE') ? 'text-danger1' : 'text-warn';
        }

        if (self.permission.JobschedulerMaster.execute.restart.terminate || self.permission.JobschedulerMaster.execute.restart.abort || self.permission.JobschedulerMaster.execute.abort ||
          self.permission.JobschedulerMaster.execute.terminate || self.permission.JobschedulerMaster.execute.pause || self.permission.JobschedulerMaster.execute.continue ||
          self.permission.JobschedulerMaster.view.mainlog || self.permission.JobschedulerMaster.administration.removeOldInstances) {
          permissionClass = 'show';
        }
        let terminateClass = 'hide', abortClass = 'hide', restartAbortClass = 'hide', pauseClass = 'hide',
          continueClass = 'hide', mainlogClass = 'hide', removeClass = 'hide', restartTerminateClass = 'hide',
          disableLink = '';

        if (self.clusterStatusData.supervisors[i].data.jobscheduler.state._text != 'RUNNING' && self.clusterStatusData.supervisors[i].data.jobscheduler.state._text != 'PAUSED' && self.clusterStatusData.supervisors[i].data.jobscheduler.state._text != 'WAITING_FOR_ACTIVATION') {
          disableLink = 'disable-link';
        }
        if (self.permission.JobschedulerMaster.execute.terminate) {
          terminateClass = 'show';
        }
        if (self.permission.JobschedulerMaster.execute.abort) {
          abortClass = 'show';

        }
        if (self.permission.JobschedulerMaster.execute.restart.abort) {
          restartAbortClass = 'show';
        }
        if (self.permission.JobschedulerMaster.execute.pause && self.clusterStatusData.supervisors[i].data.jobscheduler.state._text !== 'PAUSED') {
          pauseClass = 'show';
        }
        if (self.permission.JobschedulerMaster.execute.continue && self.clusterStatusData.supervisors[i].data.jobscheduler.state._text === 'PAUSED') {
          continueClass = 'show';
        }
        if (self.permission.JobschedulerMaster.execute.restart.terminate) {
          restartTerminateClass = 'show';
        }
        if (self.permission.JobschedulerMaster.view.mainlog) {
          mainlogClass = 'show';
        }
        if (self.permission.JobschedulerMaster.administration.removeOldInstances) {
          removeClass = 'show';
        }

        if (self.clusterStatusData.supervisors[i].data.jobscheduler.state._text) {
          //self.translate.get(self.clusterStatusData.supervisors[i].data.jobscheduler.state._text).subscribe(translatedValue => {
          status = self.clusterStatusData.supervisors[i].data.jobscheduler.state._text;
          //});
        }

        let d1 = ' - ', dis = ' - ', arc = ' - ';
        if (self.clusterStatusData.supervisors[i].data.jobscheduler.startedAt) {
          d1 = moment(self.clusterStatusData.supervisors[i].data.jobscheduler.startedAt).tz(JSON.parse(sessionStorage.preferences).zone).format(JSON.parse(sessionStorage.preferences).dateFormat);
        }
        if (self.clusterStatusData.supervisors[i].data.jobscheduler.os) {
          arc = self.clusterStatusData.supervisors[i].data.jobscheduler.os.architecture;
          dis = self.clusterStatusData.supervisors[i].data.jobscheduler.os.distribution;
        }
        self.lastId = self.clusterStatusData.supervisors[i].url;
        let popoverTemplate = '<span class="_600">' + labelArchitecture + ' :</span> ' + arc +
          '<br> <span class="_600">' + labelDistribution + ' : </span>' + dis +
          '<br> <span class="_600">' + labelUrl + ' : </span>' + self.clusterStatusData.supervisors[i].data.jobscheduler.url +
          '<br><span class="_600">' + labelVersion + ' :</span>' + self.clusterStatusData.supervisors[i].data.jobscheduler.version +
          '<br><span class="_600">' + labelStartedAt + ' : </span>' + d1 +
          '<br><span class="_600">' + labelSurveyDate + ' : </span>' + moment(self.clusterStatusData.supervisors[i].data.jobscheduler.surveyDate).tz(JSON.parse(sessionStorage.preferences).zone).format(JSON.parse(sessionStorage.preferences).dateFormat);
        self.template = self.template +
          ' <div class="cluster-rect" data-toggle="popover"   data-content=\'' + popoverTemplate + '\'' +
          'style="left:' + sLeft + 'px;top:' + 10 + 'px" id="' + self.clusterStatusData.supervisors[i].url + '">' +
          '<span id="' + 'sp' + self.clusterStatusData.supervisors[i].url + '"  class="m-t-n-xxs fa fa-stop success-node ' + colorClass + '"></span>' +
          '<div class="text-left  p-t-sm p-l-sm "><span>' + 'SUPERVISOR' +
          '</span> <span class="pull-right"><div class="btn-group dropdown" >' +
          '<a href class="hide more-option ' + permissionClass + '" data-toggle="dropdown"><i class="text fa fa-ellipsis-h"></i></a>' +
          '<div class="dropdown-menu dropdown-ac dropdown-more cluster-dropdown">' +
          '<a class="hide dropdown-item bg-hover-color ' + terminateClass + ' ' + disableLink + ' " id="' + '__supervisor-terminate-' + i + '">' + terminateBtn + '</a>' +
          '<a class="hide dropdown-item ' + abortClass + ' ' + disableLink + ' " id="' + '__supervisor-abort-' + i + '">' + abortBtn + '</a>' +
          '<a class="hide dropdown-item ' + restartAbortClass + ' ' + disableLink + ' " id="' + '__supervisor-abortAndRestart-' + i + '">' + abortAndRestartBtn + '</a>' +
          '<a class="hide dropdown-item ' + restartTerminateClass + ' ' + disableLink + ' " id="' + '__supervisor-terminateAndRestart-' + i + '">' + terminateAndRestartBtn + '</a>' +
          /*'<a class="hide dropdown-item ' + restartTerminateClass + ' ' + disableLink + ' " id="' + '__supervisor-terminateAndRestartWith-' + i + '">' + terminateAndRestartWithinBtn + '</a>' +
          '<a class="hide dropdown-item ' + pauseClass + '" id="' + '__supervisor-pause-' + i + '">' + pauseBtn + '</a>' +
          '<a class="hide dropdown-item ' + continueClass + '" id="' + '__supervisor-continue-' + i + '">' + continueBtn + '</a>' +
          '<a class="hide dropdown-item ' + removeClass + '" id="' + '__supervisor-remove-' + i + '">' + removeInstanceBtn + '</a>' +*/
          '<a class="hide dropdown-item ' + mainlogClass + ' ' + disableLink + ' " id="' + '__supervisor-download-' + i + '">' + downloadLogBtn + '</a>' +
          /*         '<a class="hide dropdown-item ' + mainlogClass + ' ' + disableLink + ' " id="' + '__supervisor-debugdownload-' + i + '">' + downloadDebugLogBtn + '</a>' +*/
          '</div>' +
          '</div></span></div>';

        if (self.clusterStatusData.supervisors[i].data.jobscheduler.os) {
          self.template = self.template + '<div class="text-left p-t-xs p-l-sm block-ellipsis-cluster"><i class="fa fa-' + self.clusterStatusData.supervisors[i].data.jobscheduler.os.name.toLowerCase() + '">' + '</i><span class="p-l-sm text-sm" title="' + self.clusterStatusData.supervisors[i].jobschedulerId + '">' + self.clusterStatusData.supervisors[i].jobschedulerId +
            '</span></div>';
        } else {
          self.template = self.template + '<div class="text-left p-t-xs p-l-sm block-ellipsis-cluster"><span class="p-l-sm text-sm" title="' + self.clusterStatusData.supervisors[i].jobschedulerId + '">' + self.clusterStatusData.supervisors[i].jobschedulerId +
            '</span></div>';
        }
        self.template = self.template + '<div class="text-sm text-left p-t-xs p-l-sm block-ellipsis-cluster"><span>' + self.clusterStatusData.supervisors[i].data.jobscheduler.url +
          '</span></div>';
        if (self.clusterStatusData.supervisors[i].data.jobscheduler.state && self.clusterStatusData.supervisors[i].data.jobscheduler.state._text) {
          self.template = self.template + '<div class="text-left text-xs p-t-xs p-b-xs p-l-sm"><span class="text-black-dk" >' + labelState + '</span>: ' +
            '<span class="text-sm ' + colorClass + '" id="' + 'state' + self.clusterStatusData.supervisors[i].url + '">' + status + '</span></div>';
        } else {
          self.template = self.template + '<div class="text-left text-xs p-t-xs p-b-xs p-l-sm"><span class="text-black-dk" >' + labelState + '</span>: ' +
            '<span id="' + 'state' + self.clusterStatusData.supervisors[i].url + '" class="' + sClassRunning + '"></span></div>';
        }
        self.template = self.template + '</div>';
        let masterTemplate = '';
        for (let j = 0; j < self.clusterStatusData.supervisors[i].masters.length; j++) {
          self.mLeft = self.mLeft + self.margin;
          if (i !== 0 || j > 0) {
            self.mLeft = self.mLeft + self.rWidth;
          }
          let name = 'JobScheduler ';
          self.top = self.rHeight + self.vMargin;
          if (self.clusterStatusData.supervisors[i].masters.length - 1 === j) {
            c = 'cluster-rect ';
          }
          if (new Date().getTime() - new Date(self.clusterStatusData.supervisors[i].masters[j].surveyDate).getTime() < 2000) {
            c = c + ' yellow-border';
          }
          if (self.clusterStatusData.supervisors[i].masters[j].role !== 'STANDALONE') {
            name = self.clusterStatusData.supervisors[i].masters[j].role;
          }
          if (!self.clusterStatusData.supervisors[i].masters[j].state) {
            self.clusterStatusData.supervisors[i].masters[j].state = {};
            self.clusterStatusData.supervisors[i].masters[j].state._text = ' ';
          }

          self.lastId = self.clusterStatusData.supervisors[i].masters[j].url;

          masterTemplate = drawSchedulerDiagram(self.clusterStatusData.supervisors[i].masters[j], name, c, j, i);

          if (j === 0) {
            self.template = self.template + '<div id="masterContainer">' + masterTemplate;
          } else if (self.clusterStatusData.supervisors[i].masters.length - 1 === j) {
            self.template = self.template + masterTemplate + '</div>';
          } else {
            self.template = self.template + masterTemplate;
          }

          if (self.clusterStatusData.supervisors.length - 1 === i && self.clusterStatusData.supervisors[i].masters.length - 1 === j) {
            if (self.clusterStatusData.members.masters.length > 0) {
              drawFlowForRemainings(false);
            } else if (self.clusterStatusData.database) {
              drawFlowForDatabase();
            } else {
              self.template = self.template + '</div>';
              self.loadComponent();
            }
          }
        }
      }
    }

    function drawSchedulerDiagram(master, name, c, index, pIndex): any {
      let colorClass = '', permissionClass = 'hide';

      if (master.state && master.state._text) {
        colorClass = master.state._text === 'RUNNING' ? 'text-success' : master.state._text === 'STOPPED' ? 'text-danger' :
          (master.state._text === 'STOPPING' || master.state._text === 'STARTING' || master.state._text === 'TERMINATING' || master.state._text === 'UNREACHABLE') ? 'text-danger1' : 'text-warn';
      } else {
        master.state = {};
      }

      if (self.permission.JobschedulerMaster.execute.restart.terminate || self.permission.JobschedulerMaster.execute.restart.abort || self.permission.JobschedulerMaster.execute.abort ||
        self.permission.JobschedulerMaster.execute.terminate || self.permission.JobschedulerMaster.execute.pause || self.permission.JobschedulerMaster.execute.continue ||
        self.permission.JobschedulerMaster.view.mainlog || self.permission.JobschedulerMaster.administration.removeOldInstances) {
        permissionClass = 'show';
      }
      let terminateClass = 'hide', abortClass = 'hide', restartAbortClass = 'hide', pauseClass = 'hide',
        continueClass = 'hide', mainlogClass = 'hide', removeClass = 'hide', restartTerminateClass = 'hide',
        disableLink = '';

      if (master.state._text != 'RUNNING' && master.state._text != 'PAUSED' && master.state._text != 'WAITING_FOR_ACTIVATION') {
        disableLink = 'disable-link';
      }
      if (self.permission.JobschedulerMaster.execute.terminate) {
        terminateClass = 'show';
      }
      if (self.permission.JobschedulerMaster.execute.abort) {
        abortClass = 'show';

      }
      if (self.permission.JobschedulerMaster.execute.restart.abort) {
        restartAbortClass = 'show';
      }
      if (self.permission.JobschedulerMaster.execute.pause && master.state._text !== 'PAUSED') {
        pauseClass = 'show';
      }
      if (self.permission.JobschedulerMaster.execute.continue && master.state._text === 'PAUSED') {
        continueClass = 'show';
      }
      if (self.permission.JobschedulerMaster.execute.restart.terminate) {
        restartTerminateClass = 'show';
      }
      if (self.permission.JobschedulerMaster.view.mainlog) {
        mainlogClass = 'show';
      }
      if (self.permission.JobschedulerMaster.administration.removeOldInstances) {
        removeClass = 'show';
      }

      if (master.state._text) {
        // self.translate.get(master.state._text).subscribe(translatedValue => {
        status = master.state._text;
        //  });
      }

      let d1 = ' - ', dis = ' - ', arc = ' - ';
      if (master.startedAt) {
        d1 = moment(master.startedAt).tz(JSON.parse(sessionStorage.preferences).zone).format(JSON.parse(sessionStorage.preferences).dateFormat);
      }
      if (master.os) {
        arc = master.os.architecture;
        dis = master.os.distribution;
      }
      let popoverTemplate = '<span class="_600">' + labelArchitecture + ' :</span> ' + arc +
        '<br> <span class="_600">' + labelDistribution + ' : </span>' + dis +
        '<br> <span class="_600">' + labelUrl + ' : </span>' + master.url +
        '<br><span class="_600">' + labelVersion + ' :</span>' + master.version +
        '<br><span class="_600">' + labelStartedAt + ' : </span>' + d1 +
        '<br><span class="_600">' + labelSurveyDate + ' : </span>' + moment(master.surveyDate).tz(JSON.parse(sessionStorage.preferences).zone).format(JSON.parse(sessionStorage.preferences).dateFormat);

      let masterTemplate = '<div data-toggle="popover"   data-content=\'' + popoverTemplate + '\'' +
        ' style="left:' + self.mLeft + 'px;top:' + self.top + 'px" id="' + master.url + '" class="' + c + '">' +
        '<span class="m-t-n-xxs fa fa-stop success-node ' + colorClass + '" id="' + 'sp' + master.url + '"></span>' +
        '<div class="text-left p-t-sm p-l-sm "><span>' + name + '</span><span class="pull-right"><div class="btn-group dropdown " >' +
        '<a class="more-option ' + permissionClass + '" data-toggle="dropdown" ><i class="text fa fa-ellipsis-h"></i></a>' +
        '<div class="dropdown-menu dropdown-ac dropdown-more cluster-dropdown">' +
        '<a class="hide dropdown-item bg-hover-color ' + terminateClass + ' ' + disableLink + ' "  id="' + '__master-terminate-' + index + '-' + pIndex + '">' + terminateBtn + '</a>' +
        '<a class="hide dropdown-item ' + abortClass + ' ' + disableLink + ' " id="' + '__master-abort-' + index + '-' + pIndex + '">' + abortBtn + '</a>' +
        '<a class="hide dropdown-item ' + restartAbortClass + ' ' + disableLink + ' " id="' + '__master-abortAndRestart-' + index + '-' + pIndex + '">' + abortAndRestartBtn + '</a>' +
        '<a class="hide dropdown-item ' + restartTerminateClass + ' ' + disableLink + ' " id="' + '__master-terminateAndRestart-' + index + '-' + pIndex + '">' + terminateAndRestartBtn + '</a>' +
        /* '<a class="hide dropdown-item ' + restartTerminateClass + ' ' + disableLink + ' " id="' + '__master-terminateAndRestartWithin-' + index + '-' + pIndex + '">' + terminateAndRestartWithinBtn + '</a>' +
         '<a class="hide dropdown-item ' + pauseClass + '" id="' + '__master-pause-' + index + '-' + pIndex + '">' + pauseBtn + '</a>' +
         '<a class="hide dropdown-item ' + continueClass + '" id="' + '__master-continue-' + index + '-' + pIndex + '">' + continueBtn + '</a>' +
         '<a class="hide dropdown-item ' + removeClass + '" id="' + '__master-remove-' + index + '-' + pIndex + '">' + removeInstanceBtn + '</a>' +*/
        '<a class="hide dropdown-item ' + mainlogClass + ' ' + disableLink + ' " id="' + '__master-download-' + index + '-' + pIndex + '">' + downloadLogBtn + '</a>' +
        /*'<a class="hide dropdown-item ' + mainlogClass + ' ' + disableLink + ' " id="' + '__master-debugdownload-' + index + '-' + pIndex + '">' + downloadDebugLogBtn + '</a>' +*/
        '</div></div>' +
        '</span></div>';

      if (master.os) {
        masterTemplate = masterTemplate + '<div class="text-left p-t-xs p-l-sm block-ellipsis-cluster"><i class="fa fa-' + master.os.name.toLowerCase() + '"></i><span class="p-l-sm text-sm" title="' + master.jobschedulerId + '">' + master.jobschedulerId +
          '</span></div>';
      } else {
        masterTemplate = masterTemplate + '<div class="text-left p-t-xs p-l-sm block-ellipsis-cluster"><i></i><span class="p-l-sm text-sm" title="' + master.jobschedulerId + '">' + master.jobschedulerId +
          '</span></div>';
      }
      masterTemplate = masterTemplate + '<div class="text-sm text-left p-t-xs p-l-sm block-ellipsis-cluster">' + master.url + '</div>' +
        '<div class="text-left text-xs p-t-xs p-b-xs p-l-sm">' +
        '<span class="text-black-dk" >' + labelState + '</span>: ' +
        '<span class="text-sm ' + colorClass + '" id="' + 'state' + master.url + '">' + status + '</span></div>' +
        '</div>';

      return masterTemplate;
    }

    function drawFlowForRemainings(zeroSupervisor) {
      for (let i = 0; i < self.clusterStatusData.members.masters.length; i++) {
        if (self.clusterStatusData.members.masters[i]) {
          let c = 'cluster-rect';
          if (zeroSupervisor && i === 0) {
            self.mLeft = self.mLeft + self.margin;
          } else {
            self.mLeft = self.mLeft + self.margin + self.rWidth;
          }

          if (self.clusterStatusData.members.masters - 1 === i) {
            c = 'cluster-rect';
          }
          if (new Date().getTime() - new Date(self.clusterStatusData.members.masters[i].surveyDate).getTime() < 2000) {
            c = c + ' yellow-border';
          }
          let name = '';
          if (self.clusterStatusData.members.masters[i].role !== 'STANDALONE') {
            name = self.clusterStatusData.members.masters[i].role;
          }
          self.lastId = self.clusterStatusData.members.masters[i].url;
          let masterTemplate = drawSchedulerDiagram(self.clusterStatusData.members.masters[i], name, c, i, 99);
          if (i === 0) {
            self.template = self.template + '<div  id="masterContainer">' + masterTemplate;
          } else {
            self.template = self.template + masterTemplate;
          }
          if (self.clusterStatusData.members.masters.length - 1 === i) {
            if (self.clusterStatusData.database) {
              drawFlowForDatabase();
            } else {
              self.template = self.template + masterTemplate + '</div></div>';
              self.loadComponent();
            }
          }
        }
      }
    }

    function drawFlowForDatabase() {
      let c = 'cluster-rect';
      self.mLeft = self.mLeft + self.margin + self.rWidth;
      let dTop = self.top - self.rHeight / 2 - 10;
      if (new Date().getTime() - new Date(self.clusterStatusData.database.surveyDate).getTime() < 2000) {
        c = c + ' yellow-border';
      }
      let popoverTemplate = '<span class="_600">' + labelSurveyDate + ' : </span>' + moment(self.clusterStatusData.database.surveyDate).tz(JSON.parse(sessionStorage.preferences).zone).format(JSON.parse(sessionStorage.preferences).dateFormat);
      let masterTemplate = '<div data-toggle="popover" data-placement="top" data-content=\'' + popoverTemplate + '\'' +
        ' style="left:' + self.mLeft + 'px;top:' + dTop + 'px" id="' + 'database' + '" class="' + c + '"   >' +
        '<span class="m-t-n-xxs fa fa-stop text-success success-node"></span>' +
        '<div class="text-left p-t-sm p-l-sm "><i class="fa fa-database"></i><span class="p-l-sm"><span >' + labelDatabase + '</span> ' + self.clusterStatusData.database.database.dbms +
        '</span></div><div class="text-sm text-left p-t-xs p-b-xs p-l-sm ">' +
        '<span>' + self.clusterStatusData.database.database.version + '</span></div></div>';

      self.template = self.template + '<div>' + masterTemplate + '</div></div>';
      self.loadComponent();
      alignToCenter();
    }

    function alignToCenter() {
      let dom = $('#divClusterStatusWidget');
      if (!dom) {
        return;
      }
      $('#clusterStatusContainer').css('height', (dom.height() - 12) + 'px');
      let containerCt = dom.height() / 2;
      let containerHCt = dom.width() / 2;
      let diagramHCt = (parseInt(document.getElementById('database').style.left.replace('px', '')) + $('#database').width() - self.margin) / 2;
      let diagramCt = (document.getElementById(self.lastId).offsetTop + document.getElementById(self.lastId).clientHeight + self.vMargin / 2) / 2;
      if (containerCt > diagramCt || containerHCt > diagramHCt) {
        let diff = (containerCt - diagramCt);
        let diffH = (containerHCt - diagramHCt);
        for (let i = 0; i < self.clusterStatusData.supervisors.length; i++) {
          if (diff > 0) {
            document.getElementById(self.clusterStatusData.supervisors[i].url).style.top =
              parseInt(document.getElementById(self.clusterStatusData.supervisors[i].url).style.top.replace('px', '')) + diff + 'px';
          }
          if (diffH > 0) {
            document.getElementById(self.clusterStatusData.supervisors[i].url).style.left =
              parseInt(document.getElementById(self.clusterStatusData.supervisors[i].url).style.left.replace('px', '')) + diffH + 'px';
          }
          for (let j = 0; j < self.clusterStatusData.supervisors[i].masters.length; j++) {
            if (diff > 0) {
              document.getElementById(self.clusterStatusData.supervisors[i].masters[j].url).style.top =
                parseInt(document.getElementById(self.clusterStatusData.supervisors[i].masters[j].url).style.top.replace('px', '')) + diff + 'px';
            }
            if (diffH > 0) {
              document.getElementById(self.clusterStatusData.supervisors[i].masters[j].url).style.left =
                parseInt(document.getElementById(self.clusterStatusData.supervisors[i].masters[j].url).style.left.replace('px', '')) + diffH / 2 + 'px';
            }
          }
        }
        for (let j = 0; j < self.clusterStatusData.members.masters.length; j++) {
          if (diff > 0) {
            document.getElementById(self.clusterStatusData.members.masters[j].url).style.top =
              parseInt(document.getElementById(self.clusterStatusData.members.masters[j].url).style.top.replace('px', '')) + diff + 'px';
          }
          if (diffH > 0) {
            document.getElementById(self.clusterStatusData.members.masters[j].url).style.left =
              parseInt(document.getElementById(self.clusterStatusData.members.masters[j].url).style.left.replace('px', '')) + diffH / 2 + 'px';
          }

        }
        if (diff > 0) {
          document.getElementById('database').style.top =
            parseInt(document.getElementById('database').style.top.replace('px', '')) + diff + 'px';
        }
        if (diffH > 0) {
          document.getElementById('database').style.left =
            parseInt(document.getElementById('database').style.left.replace('px', '')) + diffH + 'px';
        }
      }
    }
  }

  private drawConnections() {
    const self = this;
    let dLLeft = 0;
    let dLTop = 0;
    let dTop = 0;
    let dLeft = 0;
    let sWidth = 0;
    let clusterStatusContainer = document.getElementById('masterContainer');
    if (!self.clusterStatusData.supervisors) {
      return;
    }
    if (self.clusterStatusData.supervisors.length <= 0) {
      drawForRemainings();
    }

    for (let i = 0; i < self.clusterStatusData.supervisors.length; i++) {

      let clusterStatusContainer = document.getElementById('clusterStatusContainer');
      let supervisorRect = document.getElementById(self.clusterStatusData.supervisors[i].url);
      if (!supervisorRect) {
        return;
      }

      clearInterval(self.interval);

      let sLeft = supervisorRect.offsetLeft;
      let sTop = supervisorRect.offsetTop;
      let sWidth = supervisorRect.clientWidth;
      let sHeight = supervisorRect.clientHeight;

      let databaseRect = document.getElementById('database');
      dTop = databaseRect.offsetTop;
      dLeft = databaseRect.offsetLeft;
      for (let j = 0; j < self.clusterStatusData.supervisors[i].masters.length; j++) {
        let masterRect = document.getElementById(self.clusterStatusData.supervisors[i].masters[j].url);

        let mLeft = masterRect.offsetLeft;
        let mTop = masterRect.offsetTop;
        let offset = 20;

        let width = sLeft - mLeft + offset;
        let top = sTop + (sHeight / 2);
        let left = mLeft - offset;
        let mHeight = masterRect.clientHeight;
        let height = (mTop + mHeight / 2) - (sTop + sHeight / 2);

        if (sLeft < mLeft) {
          left = sLeft + sWidth;
          width = mLeft - sLeft + offset;
        }

        let node1 = document.createElement('div');
        dLLeft = mLeft + sWidth / 2;
        if (j != 0) {
          dLTop = dLTop - 10;
        } else {
          dLTop = dTop + databaseRect.clientHeight / 2;
        }

        if (dLTop < dTop) {
          databaseRect.style.setProperty('height', databaseRect.offsetHeight + 10 + 'px');
          databaseRect.style.setProperty('top', databaseRect.offsetTop - 10 + 'px');
        }

        let border = self.clusterStatusData.supervisors[i].masters[j].state._text === 'UNREACHABLE' ? '1px dashed #f44455' : '1px dashed #D9D9D9';

        node1.setAttribute('class', 'h-line');
        node1.setAttribute('id', '&&' + self.clusterStatusData.supervisors[i].masters[j].url + '&&database01');
        node1.style.setProperty('top', dLTop + 'px');
        node1.style.setProperty('left', dLLeft + 'px');
        node1.style.setProperty('width', dLeft - mLeft - sWidth / 2 + 'px');
        node1.style.setProperty('border', border);
        clusterStatusContainer.appendChild(node1);

        let node2 = document.createElement('div');
        node2.setAttribute('id', '&&' + self.clusterStatusData.supervisors[i].masters[j].url + '&&database02');
        node2.setAttribute('class', 'h-line ');
        node2.style.setProperty('top', dLTop + 'px');
        node2.style.setProperty('left', dLLeft + 'px');
        node2.style.setProperty('width', '1px');
        node2.style.setProperty('height', mTop - dLTop + 'px');
        node2.style.setProperty('border', border);
        clusterStatusContainer.appendChild(node2);

        let lNoConnection = '#D9D9D9';

        if (self.clusterStatusData.supervisors[i].data.jobscheduler.state && self.clusterStatusData.supervisors[i].data.jobscheduler.state._text.toLowerCase() === 'unreachable') {
          lNoConnection = '#eb8814';
        }
        let node3 = document.createElement('div');
        node3.setAttribute('id', '&&' + self.clusterStatusData.supervisors[i].url + '&&' + self.clusterStatusData.supervisors[i].masters[j].url + '01');
        node3.setAttribute('class', 'h-line');
        node3.style.setProperty('top', top + 'px');
        node3.style.setProperty('left', left + 'px');
        node3.style.setProperty('width', width + 'px');
        node3.style.setProperty('border', '1px solid ' + lNoConnection);
        clusterStatusContainer.appendChild(node3);
        if (sLeft < mLeft) {
          left = left + width;
        }
        let node4 = document.createElement('div');
        node4.setAttribute('id', '&&' + self.clusterStatusData.supervisors[i].url + '&&' + self.clusterStatusData.supervisors[i].masters[j].url + '02');
        node4.setAttribute('class', 'h-line');
        node4.style.setProperty('top', top + 'px');
        node4.style.setProperty('left', left + 'px');
        node4.style.setProperty('width', 1 + 'px');
        node4.style.setProperty('height', height + 'px');
        node4.style.setProperty('border', '1px solid ' + lNoConnection);
        clusterStatusContainer.appendChild(node4);
        if (sLeft < mLeft) {
          left = left - offset;
        }
        let node5 = document.createElement('div');
        node5.setAttribute('id', '&&' + self.clusterStatusData.supervisors[i].url + '&&' + self.clusterStatusData.supervisors[i].masters[j].url + '03');
        node5.setAttribute('class', 'h-line');
        node5.style.setProperty('top', top + height + 'px');
        node5.style.setProperty('left', left + 'px');
        node5.style.setProperty('width', 1 + 'px');
        node5.style.setProperty('width', offset + 'px');
        node5.style.setProperty('border', '1px solid ' + lNoConnection);
        clusterStatusContainer.appendChild(node5);

        if (j === self.clusterStatusData.supervisors[i].masters.length - 1) {
          drawForRemainings();
        }
      }
    }

    function drawForRemainings() {
      if (!self.clusterStatusData.members) {
        return;
      }
      for (let i = 0; i < self.clusterStatusData.members.masters.length; i++) {
        let masterRect = document.getElementById(self.clusterStatusData.members.masters[i].url);
        if (masterRect) {
          clearInterval(self.interval);
        }
        let vMargin = self.vMargin;

        if (masterRect) {
          var mLeft = masterRect.offsetLeft;
          var mTop = masterRect.offsetTop;
        }

        let databaseRect = document.getElementById('database');
        if (!databaseRect) {
          return;
        }
        dTop = databaseRect.offsetTop;
        dLeft = databaseRect.offsetLeft;

        if (masterRect) {
          sWidth = masterRect.offsetWidth;
        }
        dLLeft = mLeft + sWidth / 2;
        if (dLTop === 0) {
          dLTop = mTop - vMargin / 2;
          dLLeft = mLeft + sWidth / 2;

        } else {
          dLTop = dLTop - 10;
        }

        let border = self.clusterStatusData.members.masters[i].state._text === 'UNREACHABLE' ? '1px dashed #f44455' : '1px dashed #D9D9D9';


        let node = document.createElement('div');
        node.setAttribute('id', '&&' + self.clusterStatusData.members.masters[i].url + '&&database01');
        node.setAttribute('class', 'h-line');

        node.style.setProperty('top', dLTop + 'px');
        node.style.setProperty('left', dLLeft + 'px');
        node.style.setProperty('height', '1px');
        node.style.setProperty('width', dLeft - mLeft - sWidth / 2 + 'px');
        node.style.setProperty('border', border);
        clusterStatusContainer.appendChild(node);

        let node2 = document.createElement('div');
        node2.setAttribute('id', '&&' + self.clusterStatusData.members.masters[i].url + '&&database02');
        node2.setAttribute('class', 'h-line');
        node2.style.setProperty('top', dLTop + 'px');
        node2.style.setProperty('left', dLLeft + 'px');
        node2.style.setProperty('width', '1px');
        node2.style.setProperty('height', mTop - dLTop + 'px');
        node2.style.setProperty('border', border);
        clusterStatusContainer.appendChild(node2);
      }
    }
  }

  /*  ------------------ Actions -----------------------*/
  clusterAction(action, obj) {
    if (action === 'terminateAndRestartWithin' || action === 'terminateWithin' || action === 'reactivatePrimaryJobschedulerWithIn') {
      if (obj === null) {
        obj = {};
        obj.jobschedulerId = this.schedulerIds.selected;
        obj.auditLog = {};
      }
      this.getTimeout(action, obj);
    } else if (this.preferences.auditLog && (action !== 'download')) {
      let comments = {
        radio: 'predefined',
        name: obj.jobschedulerId + ' (' + obj.url + ')',
        operation: action === 'terminateFailsafe' ? 'Terminate and fail-over' : action === 'terminateAndRestart' ? 'Terminate and Restart' : action === 'abortAndRestart' ? 'Abort and Restart' : action === 'terminate' ? 'Terminate' : action === 'pause' ? 'Pause' : action === 'abort' ? 'Abort' : action === 'remove' ? 'Remove instance' : 'Continue'
      };

      const modalRef = this.modalService.open(CommentModalComponent, {backdrop: 'static'});
      modalRef.componentInstance.comments = comments;
      modalRef.componentInstance.action = action;
      modalRef.componentInstance.show = true;
      modalRef.componentInstance.obj = obj;
      modalRef.componentInstance.performAction = this.performAction;

      modalRef.result.then((result) => {
        console.log('Close...', result);
      }, (reason) => {
        console.log('close...', reason);
      });

    } else {
      this.performAction(action, obj);
    }
  }

  private postCall(url, obj) {
    this.coreService.post(url, obj).subscribe(res => {
    });
  }

  private getTimeout(action, obj) {
    let comments = {
      radio: 'predefined'
    };

    const modalRef = this.modalService.open(CommentModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.comments = comments;
    modalRef.componentInstance.action = action;
    modalRef.componentInstance.show = this.preferences.auditLog;
    modalRef.componentInstance.jobScheduleID = obj.jobschedulerId + ' (' + obj.url + ')';
    modalRef.componentInstance.obj = obj;

    modalRef.result.then((result) => {
      console.log('close...', result);
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  performAction(action, obj): void {
    if (obj === null) {
      obj = {};
      obj.jobschedulerId = this.schedulerIds.selected;
      obj.auditLog = {};
    }
    if (action === 'terminate') {
      this.postCall('jobscheduler/terminate', obj);
    } else if (action === 'abort') {
      this.postCall('jobscheduler/abort', obj);
    } else if (action === 'abortAndRestart') {
      this.postCall('jobscheduler/abort_and_restart', obj);
    } else if (action === 'terminateAndRestart') {
      this.postCall('jobscheduler/restart', obj);
    } else if (action === 'pause') {
      this.postCall('jobscheduler/pause', obj);
    } else if (action === 'continue') {
      this.postCall('jobscheduler/continue', obj);
    } else if (action === 'remove') {
      this.coreService.post('jobscheduler/cleanup', obj).subscribe(res => {
        this.coreService.post('jobscheduler/ids', {}).subscribe(res => {
          if (res) {
            this.coreService.setDefaultTab();
            this.authService.setIds(res);
            this.authService.save();
          }
        });
      });
    } else if (action === 'terminateFailsafe') {
      if (obj === null) {
        obj = {};
        obj.jobschedulerId = this.schedulerIds.selected;
        obj.auditLog = {};
      }
      this.postCall('jobscheduler/cluster/terminate_failsafe', obj);
    } else if (action === 'restart') {
      if (obj === null) {
        obj = {};
        obj.jobschedulerId = this.schedulerIds.selected;
        obj.auditLog = {};
      }
      this.postCall('jobscheduler/cluster/restart', obj);
    } else if (action === 'reactivatePrimaryJobscheduler') {
      if (obj === null) {
        obj = {};
        obj.jobschedulerId = this.schedulerIds.selected;
        obj.auditLog = {};
      }
      this.postCall('jobscheduler/cluster/reactivate', obj);
    } else if (action === 'download') {
      let result: any = {};
      this.coreService.post('jobscheduler/debuglog/info', obj).subscribe(res => {
        result = res;
        if (result && result.log) {
          this.coreService.get('jobscheduler/log?jobschedulerId=' + obj.jobschedulerId + '&filename=' + result.log.filename + '&accessToken=' + this.authService.accessTokenId).subscribe((res) => {
            this.saveToFileSystem(res, obj);
          }, () => {
            console.log('err in download');
          });
        }
      });
    } else if (action === 'debugdownload') {
      let result: any = {};
      this.coreService.post('jobscheduler/debuglog/info', obj).subscribe(res => {
        result = res;
        if (result && result.log) {
          this.coreService.get('./api/jobscheduler/debuglog?jobschedulerId=' + obj.jobschedulerId + '&filename=' + result.log.filename + '&accessToken=' + this.authService.accessTokenId).subscribe((res) => {
            this.saveToFileSystem(res, obj);
          }, () => {

          });
        }
      });
    }
  }

  private saveToFileSystem(res, obj) {
    let name = 'jobscheduler.' + obj.jobschedulerId + '.main.log';
    let fileType = 'application/octet-stream';

    if (res.headers('Content-Disposition') && /filename=(.+)/.test(res.headers('Content-Disposition'))) {
      name = /filename=(.+)/.exec(res.headers('Content-Disposition'))[1];
    }
    if (res.headers('Content-Type')) {
      fileType = res.headers('Content-Type');
    }
    const data = new Blob([res.data], {type: fileType});
    saveAs(data, name);

  }
}


