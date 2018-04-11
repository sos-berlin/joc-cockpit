import { Component, OnInit, OnDestroy, Input,  ViewChild, ComponentFactoryResolver,Directive, ViewContainerRef } from '@angular/core';
import { CoreService } from '../../../services/core.service';
import { AuthService } from '../../../components/guard/auth.service';
import { DataService } from '../../../services/data.service';
import { Subscription }   from 'rxjs/Subscription';

import * as _ from 'underscore';
import * as moment from 'moment';
declare var $ :any;


@Directive({
  selector: '[ad-host]',
})
export class AdDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

@Component({
  template: `
    <div [innerHtml]="data"></div>
  `
})

export class AdComponent {
  @Input() data: any;
}

@Component({
  selector: 'app-master-cluster',
  templateUrl: './master-cluster.component.html',
  styleUrls: ['./master-cluster.component.css']
})
export class MasterClusterComponent implements OnInit, OnDestroy {

    @Input() permission:any;
    isLoaded:boolean = false;
    rWidth:number = 200;
    tWidth:number = 0;
    rHeight:number = 130;
    margin:number = 35;
    vMargin:number = 70;
    mLeft:number = 0;
    top:number = 0;
    clusterStatusData:any;
    supervisedMasters = [];
    schedulerIds:any;
    lastId:any;
    template:any = '';
    subscription:Subscription;
    selectedJobScheduler:any = {clusterType:{}};

    interval:any;

     @ViewChild(AdDirective) adHost: AdDirective;

    constructor(private authService:AuthService, public coreService:CoreService, private dataService:DataService, private componentFactoryResolver: ComponentFactoryResolver) {
        this.subscription = dataService.eventAnnounced$.subscribe(res => {
            this.refreshDiagram(res);
        });
    }

    private refreshDiagram(args) {
        for (let i = 0; i < args.length; i++) {
            if (args[i].jobschedulerId == this.schedulerIds.selected) {
                if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
                    for (let j = 0; j < args[i].eventSnapshots.length; j++) {
                        if (args[i].eventSnapshots[j].eventType === "SchedulerStateChanged") {
                            this.getClusterStatusData();
                            break;
                        }
                    }
                }
                break
            }
        }
    }

    ngOnInit() {
      this.schedulerIds = JSON.parse(this.authService.scheduleIds);
      if (sessionStorage.$SOS$JOBSCHEDULE && JSON.parse(sessionStorage.$SOS$JOBSCHEDULE)) {
        this.selectedJobScheduler = JSON.parse(sessionStorage.$SOS$JOBSCHEDULE);
      }
      this.getClusterStatusData();
    }


    ngOnDestroy() {
        this.subscription.unsubscribe();
        clearInterval(this.interval);
    }

    getClusterStatusData():void {
        let obj = {
            database: {},
            members: {}
        };

        this.coreService.post('jobscheduler/db', {jobschedulerId: this.schedulerIds.selected}).subscribe(res=> {
            obj.database = res;
            this.coreService.post('jobscheduler/cluster/members/p', {jobschedulerId: this.schedulerIds.selected}).subscribe(res=> {
                obj.members = res;
                this.prepareDataObj(obj);

            }, (err)=> {
                this.isLoaded = true;

            });
        }, (err)=> {
            this.isLoaded = true;
        });
    }

    private getSupervisor(resP):any {
/*      let result: any;
      resP.jobscheduler.state = result.jobscheduler.state;
      resP.jobscheduler.startedAt = result.jobscheduler.startedAt;*/
      return this.coreService.post('jobscheduler/supervisor', {jobschedulerId: this.schedulerIds.selected})
    }

    private getSupervisorDetails(): any {
      this.coreService.post('jobscheduler/supervisor/p', {jobschedulerId: this.schedulerIds.selected}).subscribe(res => {
        return this.getSupervisor(res);
      }, (err) => {
        return this.getSupervisor(null);
      });
    }

    private onRefresh():any{
      return this.coreService.post('jobscheduler/cluster/members', {jobschedulerId: this.schedulerIds.selected})
    }

    private prepareDataObj(obj) {
        if (obj.members.masters && obj.members.masters.length > 1) {
            obj.members.masters.sort(function (a, b) {
                return a.clusterType.precedence - b.clusterType.precedence;
            });
        }
        this.clusterStatusData = obj;
        this.isLoaded = true;
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
        this.template = '<div id="clusterStatusContainer"> ';
        this.prepareData();
    }

   refresh() {
     $("#clusterStatusContainer").remove();
     if (this.clusterStatusData) {
       this.init();
       this.prepareData();

     } else {
       this.template += "<div style='top: 50%;left: 40%;' class='h6 text-u-c pos-abt' translate>message.noDataAvailable</div>";
       this.template = this.template + '</div>';
       //Compile html to angular
       this.loadComponent();
     }
   }

   loadComponent() {
     let componentFactory = this.componentFactoryResolver.resolveComponentFactory(AdComponent);
     let viewContainerRef = this.adHost.viewContainerRef;
     viewContainerRef.clear();
     let componentRef = viewContainerRef.createComponent(componentFactory);
      componentRef.instance.data = this.template;
   }

    clusterStatusDataChanged () {
      this.refresh();
    }

    startToCheck() {
      let self  = this;
      this.interval = setInterval(function () {
        self.drawConnections();
      }, 200);
    }

    private prepareData() {
      var supervisors = [];
      this.clusterStatusData.supervisors = this.clusterStatusData.supervisors || [];

      if (!this.clusterStatusData.members || !this.clusterStatusData.members.masters) {
        return;
      }

      this.startToCheck();
      let self  = this;
      this.clusterStatusData.members.masters.forEach(function (master, index) {
        if (!master.supervisor && index == self.clusterStatusData.members.masters.length - 1) {
          removeSupervised();
          return;
        }
        if (!master.supervisor) {
          return;
        }

        self.supervisedMasters.push(index);
        var nMaster = {};
        if (supervisors.indexOf(master.supervisor.jobschedulerId) >= 0) {

          self.clusterStatusData.supervisors[supervisors.indexOf(master.supervisor.jobschedulerId)].masters.push(_.extend(master, nMaster));
        } else {
          supervisors.push(master.supervisor.jobschedulerId);
          var nSupervisor = master.supervisor;
          nSupervisor.masters = [];
          nSupervisor.masters.push(_.extend(master, nMaster));
          self.clusterStatusData.supervisors.push(nSupervisor);
        }

        if (index == self.clusterStatusData.members.masters.length - 1) {
          removeSupervised();
        }

      });


      function removeSupervised() {

        if (self.clusterStatusData.supervisors.length <= 0) {
          getTemporaryData(null);
        }

        self.supervisedMasters.forEach(function (master, index) {
          self.clusterStatusData.members.masters.splice(master - index, 1);
          if (index == self.supervisedMasters.length - 1) {
            getSupervisor(null);
          }
        })

      }

      function getSupervisor(refresh) {
        if (self.clusterStatusData.supervisors.length <= 0) {
          getTemporaryData(refresh);
        }
        self.clusterStatusData.supervisors.forEach(function (supervisor, index) {

          self.getSupervisorDetails().subscribe(res => {
            self.clusterStatusData.supervisors[index].data = res;
            if (refresh) {
              refreshSupervisorState(supervisor);
            }
            if (index == self.clusterStatusData.supervisors.length - 1) {
              getTemporaryData(refresh);
            }
          })
        })
      }

      function getTemporaryData(refresh) {

        self.onRefresh().subscribe( (res)=> {
          if (self.clusterStatusData.supervisors.length <= 0) {
            getTemporaryData2(res, refresh);
          }

          self.clusterStatusData.supervisors.forEach( function (supervisor, sIndex) {
            supervisor.masters.forEach( function (master, index) {
              res.masters.forEach(function (nMaster, rIndex) {
                if (nMaster.host == master.host && nMaster.port == master.port) {
                  supervisor.masters[index].state = nMaster.state;
                  supervisor.masters[index].startedAt = nMaster.startedAt;
                  if (master.state && refresh) {
                    refreshMasterState(master);
                  }
                }
                if (self.clusterStatusData.supervisors.length - 1 == sIndex && supervisor.masters.length - 1 == index && res.masters.length - 1 == rIndex) {
                  getTemporaryData2(res, refresh);
                }
              })
            });
        //    $rootScope.$broadcast('reloadScheduleDetail', supervisor);
          })

        },  (err)=> {
          getTemporaryData2(undefined, refresh);
        })

      }

      function getTemporaryData2(res, refresh) {
        if ((self.clusterStatusData.members.masters.length == 0 && !refresh) || !res) {
          drawFlow();
        }

        if (res)
          self.clusterStatusData.members.masters.forEach(function (master, index) {

            res.masters.forEach( function (nMaster, rIndex) {
              if (nMaster.host == master.host && nMaster.port == master.port) {
                self.clusterStatusData.members.masters[index].state = nMaster.state;
                self.clusterStatusData.members.masters[index].startedAt = nMaster.startedAt;
                if (master.state && refresh) {
                  refreshMasterState(master);
                }
              }
              if (self.clusterStatusData.members.masters.length - 1 == index && res.masters.length - 1 == rIndex && !refresh) {
                drawFlow();
              }
            });

            if (refresh && (refresh.state == 'stopping' || refresh.state == 'starting') && res.masters.length == 0) {
              if (master.state._text !== ' ') {
                master.state._text = refresh.state;
                refreshMasterState(master);
              }

            }
          });
        //$rootScope.$broadcast('reloadScheduleDetail', self.clusterStatusData.members);

      }


      function refreshMasterState(master) {

        var span = document.getElementById('sp' + master.host + master.port);
        var dState = document.getElementById('state' + master.host + master.port);
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
        var sLeft = 0;
        self.top = self.vMargin;
        if (self.clusterStatusData.supervisors.length == 0) {
          drawFlowForRemainings(true);

        }
        self.clusterStatusData.supervisors.forEach( function (supervisor, sIndex) {
          self.tWidth = self.rWidth * supervisor.masters.length + self.margin * (supervisor.masters.length - 1);
          sLeft = self.tWidth / 2 - self.rWidth / 2 + self.margin;
          if (sIndex !== 0) {
            sLeft = sLeft + self.tWidth + self.margin;
          }

          var c = "cluster-rect";
          if (new Date().getTime() - new Date(supervisor.data.jobscheduler.surveyDate).getTime() < 2000) {
            c = c + " yellow-border";
          }


          var sClassRunning = 'text-success';

          if (supervisor.data.jobscheduler.state && supervisor.data.jobscheduler.state._text.toLowerCase() == 'stopped') {
            sClassRunning = 'text-danger';
          } else if (supervisor.data.jobscheduler.state && supervisor.data.jobscheduler.state._text.toLowerCase() == 'unreachable') {
            sClassRunning = 'text-danger1';
          }
          else if (!supervisor.data.jobscheduler.state || supervisor.data.jobscheduler.state._text.toLowerCase() != 'running') {
            sClassRunning = 'text-warn';
          }


          self.lastId = supervisor.host + supervisor.port;
          self.template = self.template +
            ' <div class="cluster-rect" ' +
            'style="left:' + sLeft + 'px;top:' + 10 + 'px" id="' + supervisor.host + supervisor.port + '">' +
            '<span id="' + 'sp' + supervisor.host + supervisor.port + '"  class="m-t-n-xxs fa fa-stop text-warn success-node" [ngClass]="{\'text-success\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'RUNNING\',\'text-danger\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'STOPPED\',\'text-danger1\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'STOPPING\'||clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'STARTING\'||clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'TERMINATING\'||clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'UNREACHABLE\'||clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\' \'}" ></span>' +
            '<div class="text-left  p-t-sm p-l-sm "><span>' + 'SUPERVISOR' +
            '</span> <span class="pull-right"><div class="btn-group dropdown" >' +
            '<a href class="hide more-option" data-toggle="dropdown" [ngClass]="{show:permission.JobschedulerMaster.execute.restart.terminate || permission.JobschedulerMaster.execute.restart.abort ||permission.JobschedulerMaster.execute.abort || permission.JobschedulerMaster.execute.terminate || permission.JobschedulerMaster.execute.pause || permission.JobschedulerMaster.execute.continue || permission.JobschedulerMaster.view.mainlog || permission.JobschedulerMaster.administration.removeOldInstances}"><i class="text fa fa-ellipsis-h"></i></a>' +
            '<div class="dropdown-menu dropdown-ac dropdown-more cluster-dropdown">' +
            '<a class="hide dropdown-item bg-hover-color" (click)="action1(\'' + sIndex + '\',\'undefined\',\'terminate\')" [ngClass]="{\'show\':permission.JobschedulerMaster.execute.terminate,\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__supervisor,terminate,' + supervisor.host + ':' + supervisor.port + '" translate>button.terminate</a>' +
            '<a class="hide dropdown-item bg-hover-color" (click)="action1(\'' + sIndex + '\',\'undefined\',\'terminateWithin\')" [ngClass]="{\'show\':permission.JobschedulerMaster.execute.terminate,\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__supervisor,terminateWithin,' + supervisor.host + ':' + supervisor.port + '" translate>button.terminateWithin</a>' +
            '<a class="hide dropdown-item" (click)="action1(\'' + sIndex + '\',\'undefined\',\'abort\')" [ngClass]="{\'show\':permission.JobschedulerMaster.execute.abort,\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'WAITING_FOR_ACTIVATION\'}"  id="' + '__supervisor,abort,' + supervisor.host + ':' + supervisor.port + '" translate>button.abort</a>' +
            '<a class="hide dropdown-item" (click)="action1(\'' + sIndex + '\',\'undefined\',\'abortAndRestart\')" [ngClass]="{\'show\':permission.JobschedulerMaster.execute.restart.abort,\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__supervisor,abortAndRestart,' + supervisor.host + ':' + supervisor.port + '" translate>button.abortAndRestart</a>' +
            '<a class="hide dropdown-item" (click)="action1(\'' + sIndex + '\',\'undefined\',\'terminateAndRestart\')" [ngClass]="{\'show\':permission.JobschedulerMaster.execute.restart.terminate,\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__supervisor,terminateAndRestart,' + supervisor.host + ':' + supervisor.port + '" translate>button.terminateAndRestart</a>' +
            '<a class="hide dropdown-item" (click)="action1(\'' + sIndex + '\',\'undefined\',\'terminateAndRestartwithTimeout\')" [ngClass]="{\'show\':permission.JobschedulerMaster.execute.restart.terminate,\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__supervisor,terminateAndRestartWithin,' + supervisor.host + ':' + supervisor.port + '" translate>button.terminateAndRestartWithin</a>' +
            '<a class="hide dropdown-item"  (click)="action1(\'' + sIndex + '\',\'undefined\',\'pause\')" [ngClass]="{show:clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'PAUSED\' && permission.JobschedulerMaster.execute.pause, \'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__supervisor,pause,' + supervisor.host + ':' + supervisor.port + '" translate>button.pause</a>' +
            '<a class="hide dropdown-item" (click)="action1(\'' + sIndex + '\',\'undefined\',\'continue\')" [ngClass]="{show:clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'PAUSED\' && permission.JobschedulerMaster.execute.continue}"  id="' + '__supervisor,continue,' + supervisor.host + ':' + supervisor.port + '" translate>button.continue</a>' +
            '<a class="hide dropdown-item" (click)="action1(\'' + sIndex + '\',\'undefined\',\'remove\')" [ngClass]="{show:permission.JobschedulerMaster.administration.removeOldInstances}" id="' + '__supervisor,remove,' + supervisor.host + ':' + supervisor.port + '" translate>button.removeInstance</a>' +
            '<a class="hide dropdown-item" (click)="action1(\'' + sIndex + '\',\'undefined\',\'downloadLog\')" [ngClass]="{show:clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'RUNNING\' && permission.JobschedulerMaster.view.mainlog,\'disable-link\': clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__supervisor,download_log,' + supervisor.host + ':' + supervisor.port + '" translate>button.downloadLog</a>' +
            '</div>' +
            '</div></span></div>';

          if (supervisor.data.jobscheduler.os) {
            self.template = self.template + '<div class="text-left p-t-xs p-l-sm block-ellipsis-cluster"><i class="fa fa-' + supervisor.data.jobscheduler.os.name.toLowerCase() + '">' + '</i><span class="p-l-sm text-sm" title="' + supervisor.jobschedulerId + '">' + supervisor.jobschedulerId +
              '</span></div>';
          } else {
            self.template = self.template + '<div class="text-left p-t-xs p-l-sm block-ellipsis-cluster"><span class="p-l-sm text-sm" title="' + supervisor.jobschedulerId + '">' + supervisor.jobschedulerId +
              '</span></div>';
          }
          self.template = self.template + '<div class="text-sm text-left p-t-xs p-l-sm block-ellipsis-cluster"><span>' + supervisor.host + ':' + supervisor.port +
            '</span></div>';
          if (supervisor.data.jobscheduler.state && supervisor.data.jobscheduler.state._text) {
            self.template = self.template + '<div class="text-left text-xs p-t-xs p-b-xs p-l-sm"><span class="text-black-dk" translate>label.state</span>: <span class="text-sm text-warn" id="' + 'state' + supervisor.host + supervisor.port + '" [ngClass]="{\'text-success\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'RUNNING\',\'text-danger\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'STOPPED\',\'text-danger1\':clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'STOPPING\'||clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'STARTING\'||clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'TERMINATING\'||clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\'UNREACHABLE\'||clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text==\' \'}" >{{clusterStatusData.supervisors[\'' + sIndex + '\'].data.jobscheduler.state._text | translate}}</span></div>';
          } else {
            self.template = self.template + '<div class="text-left text-xs p-t-xs p-b-xs p-l-sm"><span class="text-black-dk" translate>label.state</span>: <span id="' + 'state' + supervisor.host + supervisor.port + '" class="' + sClassRunning + '"></span></div>';
          }
          self.template = self.template + '</div>';
          var masterTemplate = '';

          supervisor.masters.forEach(function (master, index) {
            self.mLeft = self.mLeft + self.margin;
            if (sIndex !== 0 || index > 0) {
              self.mLeft = self.mLeft + self.rWidth;
            }

            var name = 'JobScheduler ';

            self.top = self.rHeight + self.vMargin;
            if (supervisor.masters.length - 1 == index) {
              c = "cluster-rect ";
            }


            if (new Date().getTime() - new Date(master.surveyDate).getTime() < 2000) {

              c = c + " yellow-border";
            }



            if (master.clusterType && master.clusterType._type == 'PASSIVE') {
              if (master.clusterType.precedence == 0) {
                name = 'PRIMARY';
              } else {
                name = 'BACKUP';
              }

            } else if (master.clusterType && master.clusterType._type == 'ACTIVE') {
              name = 'JobScheduler JS' + (index + 1);

            }
            if (master.clusterType._type == "PASSIVE" && !master.state) {
              master.state = {};
              master.state._text = ' ';
            }

            self.lastId = master.host + master.port;
            masterTemplate = '<div '  +
              'style="left:' + self.mLeft + 'px;top:' + top + 'px" id="' + master.host + master.port + '" class="' + c + '"   >' +
              '<span class="m-t-n-xxs fa fa-stop text-warn success-node" [ngClass]="{\'text-success\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'RUNNING\',\'text-danger\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'STOPPED\',\'text-danger1\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'STOPPING\'||clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'STARTING\'||clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'TERMINATING\'||clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'UNREACHABLE\'||clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\' \'}" id="' + 'sp' + master.host + master.port + '"  ></span>' +
              '<div class="text-left  p-t-sm p-l-sm "><span>' + name + '</span><span class="pull-right"><div class="btn-group dropdown " >' +
              '<a href class="hide more-option" [ngClass]="{show:permission.JobschedulerMaster.execute.restart.terminate || permission.JobschedulerMaster.execute.restart.abort ||permission.JobschedulerMaster.execute.abort || permission.JobschedulerMaster.execute.terminate ||permission.JobschedulerMaster.execute.pause || permission.JobschedulerMaster.execute.continue || permission.JobschedulerMaster.view.mainlog || permission.JobschedulerMaster.administration.removeOldInstances}" data-toggle="dropdown" ><i class="text fa fa-ellipsis-h"></i></a>' +
              '<div class="dropdown-menu dropdown-ac dropdown-more cluster-dropdown">' +
              '<a class="hide dropdown-item" (click)="action1(\'' + sIndex + '\',\'' + index + '\',\'terminate\')" bg-hover-color" [ngClass]="{\'show\':permission.JobschedulerMaster.execute.terminate,\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__master,terminate,' + master.host + ':' + master.port + '" translate>button.terminate</a>' +
              '<a class="hide dropdown-item" (click)="action1(\'' + sIndex + '\',\'' + index + '\',\'terminateWithin\')" bg-hover-color" [ngClass]="{\'show\':permission.JobschedulerMaster.execute.terminate,\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__master,terminateWithin,' + master.host + ':' + master.port + '" translate>button.terminateWithin</a>' +
              '<a class="hide dropdown-item" (click)="action1(\'' + sIndex + '\',\'' + index + '\',\'abort\')" [ngClass]="{\'show\':permission.JobschedulerMaster.execute.abort,\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__master,abort,' + master.host + ':' + master.port + '" translate>button.abort</a>' +
              '<a class="hide dropdown-item" (click)="action1(\'' + sIndex + '\',\'' + index + '\',\'abortAndRestart\')" [ngClass]="{\'show\':permission.JobschedulerMaster.execute.restart.abort,\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__master,abortAndRestart,' + master.host + ':' + master.port + '" translate>button.abortAndRestart</a>' +
              '<a class="hide dropdown-item" (click)="action1(\'' + sIndex + '\',\'' + index + '\',\'terminateAndRestart\')" [ngClass]="{\'show\':permission.JobschedulerMaster.execute.restart.terminate,\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__master,terminateAndRestart,' + master.host + ':' + master.port + '" translate>button.terminateAndRestart</a>' +
              '<a class="hide dropdown-item" (click)="action1(\'' + sIndex + '\',\'' + index + '\',\'terminateAndRestartWithTimeout\')" [ngClass]="{\'show\':permission.JobschedulerMaster.execute.restart.terminate,\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__master,terminateAndRestartWithin,' + master.host + ':' + master.port + '" translate>button.terminateAndRestartWithin</a>' +
              '<a class="hide dropdown-item" (click)="action1(\'' + sIndex + '\',\'' + index + '\',\'pause\')" [ngClass]="{\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\',show:clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'PAUSED\' && permission.JobschedulerMaster.execute.pause}"  id="' + '__master,pause,' + master.host + ':' + master.port + '" translate>button.pause</a>' +
              '<a class="hide dropdown-item" (click)="action1(\'' + sIndex + '\',\'' + index + '\',\'continue\')" [ngClass]="{\'show\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'PAUSED\' && permission.JobschedulerMaster.execute.continue}"  id="' + '__master,continue,' + master.host + ':' + master.port + '" translate>button.continue</a>' +
              '<a class="hide dropdown-item" (click)="action1(\'' + sIndex + '\',\'' + index + '\',\'remove\')" [ngClass]="{\'show\':permission.JobschedulerMaster.administration.removeOldInstances}" id="' + '__master,remove,' + master.host + ':' + master.port + '" translate>button.removeInstance</a>' +
              '<a class="hide dropdown-item" (click)="action1(\'' + sIndex + '\',\'' + index + '\',\'downloadLog\')" [ngClass]="{\'disable-link\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\',show:permission.JobschedulerMaster.view.mainlog }" id="' + '__master,download_log,' + master.host + ':' + master.port + '" translate>button.downloadLog</a>' +
              '</div></div>' +
              '</span></div>';
            if (master.os) {
              masterTemplate = masterTemplate + '<div class="text-left p-t-xs p-l-sm block-ellipsis-cluster"><i class="fa fa-' + master.os.name.toLowerCase() + '"></i><span class="p-l-sm text-sm" title="' + master.jobschedulerId + '">' + master.jobschedulerId +
                '</span></div>';
            } else {
              masterTemplate = masterTemplate + '<div class="text-left p-t-xs p-l-sm block-ellipsis-cluster"><i></i><span class="p-l-sm text-sm" title="' + master.jobschedulerId + '">' + master.jobschedulerId +
                '</span></div>';
            }
            masterTemplate = masterTemplate + '<div class="text-sm text-left p-t-xs p-l-sm block-ellipsis-cluster">' + master.host + ':' + master.port + '</div>' +
              '<div class="text-left text-xs p-t-xs p-b-xs p-l-sm"><span class="text-black-dk" translate>label.state</span>: <span class="text-sm text-warn" id="' + 'state' + master.host + master.port + '" [ngClass]="{\'text-success\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'RUNNING\',\'text-danger\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'STOPPED\',\'text-danger1\':clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'STOPPING\'||clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'STARTING\'||clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'TERMINATING\'||clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'UNREACHABLE\'||clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\' \'}" [innerHtml]="clusterStatusData.supervisors[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text | translate"></span></div>' +
              '</div>';

            if (index == 0) {
              self.template = self.template + '<div   id="masterContainer">' + masterTemplate;
            } else if (supervisor.masters.length - 1 == index) {
              self.template = self.template + masterTemplate + '</div>';
            } else {
              self.template = self.template + masterTemplate;
            }


            if (self.clusterStatusData.supervisors.length - 1 == sIndex && supervisor.masters.length - 1 == index) {


              if (self.clusterStatusData.members.masters.length > 0) {
                drawFlowForRemainings(false);
              } else if (self.clusterStatusData.database) {
                drawFlowForDatabase();
              } else {
                self.template = self.template + '</div>';
                 self.loadComponent();
              }
            }

          })
        })
      }

      function drawFlowForRemainings(zeroSupervisor) {

        self.clusterStatusData.members.masters.forEach(function (master, index) {

          if (master) {

            var c = "cluster-rect";
            if (zeroSupervisor && index == 0) {
              self.mLeft = self.mLeft + self.margin;
            } else {
              self.mLeft = self.mLeft + self.margin + self.rWidth;
            }

            if (self.clusterStatusData.members.masters - 1 == index) {
              c = "cluster-rect";
            }
            if (new Date().getTime() - new Date(master.surveyDate).getTime() < 2000) {

              c = c + " yellow-border";
            }
            var name = '';
            if (master.clusterType && master.clusterType._type == 'PASSIVE') {
              if (master.clusterType.precedence == 0) {
                name = 'PRIMARY';
              } else {
                name = 'BACKUP';
              }

            } else if (master.clusterType && master.clusterType._type == 'ACTIVE') {
              name = 'JobScheduler JS' + (index + 1);

            }


            self.lastId = master.host + master.port;


            var masterTemplate = '<div '   +
              'style="left:' + self.mLeft + 'px;top:' + top + 'px" id="' + master.host + master.port + '" class="' + c + '"   >' +
              '<span class="m-t-n-xxs fa fa-stop text-warn success-node" [ngClass]="{\'text-success\':clusterStatusData.members.masters[\'' + index + '\'].state._text==\'RUNNING\',\'text-danger\':clusterStatusData.members.masters[\'' + index + '\'].state._text==\'STOPPED\',\'text-danger1\':clusterStatusData.members.masters[\'' + index + '\'].state._text==\'STOPPING\'||clusterStatusData.members.masters[\'' + index + '\'].state._text==\'STARTING\'||clusterStatusData.members.masters[\'' + index + '\'].state._text==\'TERMINATING\'||clusterStatusData.members.masters[\'' + index + '\'].state._text==\'UNREACHABLE\'||clusterStatusData.members.masters[\'' + index + '\'].state._text==\' \'}" id="' + 'sp' + master.host + master.port + '"  ></span>' +
              '<div class="text-left  p-t-sm p-l-sm "><span>' + name + '</span><span class="pull-right"><div class="btn-group dropdown " >' +
              '<a href class="hide more-option" [ngClass]="{show:permission.JobschedulerMaster.execute.restart.terminate || permission.JobschedulerMaster.execute.restart.abort ||permission.JobschedulerMaster.execute.abort || permission.JobschedulerMaster.execute.terminate ||permission.JobschedulerMaster.execute.pause || permission.JobschedulerMaster.execute.continue || permission.JobschedulerMaster.view.mainlog || permission.JobschedulerMaster.administration.removeOldInstances}" data-toggle="dropdown" ><i class="text fa fa-ellipsis-h"></i></a>' +
              '<div class="dropdown-menu dropdown-ac dropdown-more cluster-dropdown">' +
              '<a class="hide dropdown-item bg-hover-color" (click)="action1(\'undefined\',\'' + index + '\',\'terminate\')"  [ngClass]="{show:permission.JobschedulerMaster.execute.terminate,\'disable-link\':clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__master,terminate,' + master.host + ':' + master.port + '" translate>button.terminate</a>' +
              '<a class="hide dropdown-item bg-hover-color" (click)="action1(\'undefined\',\'' + index + '\',\'terminateWithin\')"  [ngClass]="{show:permission.JobschedulerMaster.execute.terminate,\'disable-link\':clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__master,terminateWithin,' + master.host + ':' + master.port + '" translate>button.terminateWithin</a>' +
              '<a class="hide dropdown-item" (click)="action1(\'undefined\',\'' + index + '\',\'abort\')" [ngClass]="{show:permission.JobschedulerMaster.execute.abort,\'disable-link\':clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__master,abort,' + master.host + ':' + master.port + '" translate>button.abort</a>' +
              '<a class="hide dropdown-item" (click)="action1(\'undefined\',\'' + index + '\',\'abortAndRestart\')" [ngClass]="{show:permission.JobschedulerMaster.execute.restart.abort,\'disable-link\':clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__master,abortAndRestart,' + master.host + ':' + master.port + '" translate>button.abortAndRestart</a>' +
              '<a class="hide dropdown-item" (click)="action1(\'undefined\',\'' + index + '\',\'terminateAndRestart\')" [ngClass]="{show:permission.JobschedulerMaster.execute.restart.terminate,\'disable-link\':clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__master,terminateAndRestart,' + master.host + ':' + master.port + '" translate>button.terminateAndRestart</a>' +
              '<a class="hide dropdown-item" (click)="action1(\'undefined\',\'' + index + '\',\'terminateAndRestartWithTimeout\')" [ngClass]="{show:permission.JobschedulerMaster.execute.restart.terminate,\'disable-link\':clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\'}" id="' + '__master,terminateAndRestartWithin,' + master.host + ':' + master.port + '" translate>button.terminateAndRestartWithin</a>' +
              '<a class="hide dropdown-item" (click)="action1(\'undefined\',\'' + index + '\',\'pause\')" [ngClass]="{\'disable-link\':clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\',show:permission.JobschedulerMaster.execute.pause && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'PAUSED\' }"  id="' + '__master,pause,' + master.host + ':' + master.port + '" translate>button.pause</a>' +
              '<a class="hide dropdown-item" (click)="action1(\'undefined\',\'' + index + '\',\'continue\')" [ngClass]="{\'show\':permission.JobschedulerMaster.execute.continue && clusterStatusData.members.masters[\'' + index + '\'].state._text==\'PAUSED\'}"  id="' + '__master,continue,' + master.host + ':' + master.port + '" translate>button.continue</a>' +
              '<a class="hide dropdown-item" (click)="action1(\'undefined\',\'' + index + '\',\'remove\')" [ngClass]="{\'show\':permission.JobschedulerMaster.administration.removeOldInstances}" id="' + '__master,remove,' + master.host + ':' + master.port + '" translate>button.removeInstance</a>' +
              '<a class="hide dropdown-item" (click)="action1(\'undefined\',\'' + index + '\',\'downloadLog\')"  [ngClass]="{\'disable-link\':clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'RUNNING\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'PAUSED\' && clusterStatusData.members.masters[\'' + index + '\'].state._text!=\'WAITING_FOR_ACTIVATION\',show:permission.JobschedulerMaster.view.mainlog }" id="' + '__master,download_log,' + master.host + ':' + master.port + '" translate>button.downloadLog</a>' +
              '</div></div>' +
              '</span></div>';
            if (master.os) {
              masterTemplate = masterTemplate + '<div class="text-left p-t-xs p-l-sm block-ellipsis-cluster"><i class="fa fa-' + master.os.name.toLowerCase() + '"></i><span class="p-l-sm text-sm" title="' + master.jobschedulerId + '">' + master.jobschedulerId +
                '</span></div>';
            } else {
              masterTemplate = masterTemplate + '<div class="text-left p-t-xs p-l-sm block-ellipsis-cluster"><i></i><span class="p-l-sm text-sm" title="' + master.jobschedulerId + '">' + master.jobschedulerId +
                '</span></div>';
            }
            masterTemplate = masterTemplate + '<div class="text-sm text-left p-t-xs p-l-sm block-ellipsis-cluster">' + master.host + ':' + master.port + '</div>' +
              '<div class="text-left text-xs p-t-xs p-b-xs p-l-sm"><span class="text-black-dk" translate>label.state</span>: <span class="text-sm text-warn" id="' + 'state' + master.host + master.port + '" [ngClass]="{\'text-success\':clusterStatusData.members.masters[\'' + index + '\'].state._text==\'RUNNING\',\'text-danger\':clusterStatusData.members.masters[\'' + index + '\'].state._text==\'STOPPED\',\'text-danger1\':clusterStatusData.members.masters[\'' + index + '\'].state._text==\'STOPPING\'||clusterStatusData.members.masters[\'' + index + '\'].state._text==\'STARTING\'||clusterStatusData.members.masters[\'' + index + '\'].state._text==\'TERMINATING\'||clusterStatusData.members.masters[\'' + index + '\'].state._text==\'UNREACHABLE\'||clusterStatusData.members.masters[\'' + index + '\'].state._text==\' \'}">{{clusterStatusData.members.masters[\'' + index + '\'].state._text | translate}}</span></div>' +
              '</div>';

            if (index == 0) {
              self.template = self.template + '<div   id="masterContainer">' + masterTemplate;
            }
            else {
              self.template = self.template + masterTemplate;
            }

            if (self.clusterStatusData.members.masters.length - 1 == index) {
              if (self.clusterStatusData.database) {
                drawFlowForDatabase();
              } else {
                self.template = self.template + masterTemplate + '</div></div>';
                self.loadComponent();
              }

            }

          }
        })
      }

      function drawFlowForDatabase() {
        var c = "cluster-rect";
        self.mLeft = self.mLeft + self.margin + self.rWidth;
        var dTop = self.top - self.rHeight / 2 - 10;

        if (new Date().getTime() - new Date(self.clusterStatusData.database.surveyDate).getTime() < 2000) {

          c = c + " yellow-border";
        }



        var masterTemplate = '<div '  +
          'style="left:' + self.mLeft + 'px;top:' + dTop + 'px" id="' + 'database' + '" class="' + c + '"   >' +
          '<span class="m-t-n-xxs fa fa-stop text-success success-node"></span>' +
          '<div class="text-left p-t-sm p-l-sm "><i class="fa fa-database"></i><span class="p-l-sm"><span translate>label.database</span> ' + self.clusterStatusData.database.database.dbms +
          '</span></div>' +
          '<div class="text-sm text-left p-t-xs p-b-xs p-l-sm ">' +
          '<span [innerHtml]="clusterStatusData.database.database.version"></span></div>' +
          '</div>';

        self.template = self.template + '<div   id="masterContainer">' + masterTemplate + '</div></div>' +
 self.loadComponent();
          console.log('>>>>>>>>>')
       // alignToCenter();
      }


      function alignToCenter() {
        var containerCt = $("#divClusterStatusWidget").height() / 2;
        var containerHCt = $("#divClusterStatusWidget").width() / 2;
        var diagramHCt = (parseInt(document.getElementById('database').style.left.replace('px', '')) + $("#database").width() - self.margin) / 2;
        var diagramCt = (document.getElementById(self.lastId).offsetTop + document.getElementById(self.lastId).clientHeight + self.vMargin / 2) / 2;
        if (containerCt > diagramCt || containerHCt > diagramHCt) {
          var diff = (containerCt - diagramCt);
          var diffH = (containerHCt - diagramHCt);
          self.clusterStatusData.supervisors.forEach(function (supervisor, sIndex) {
            if (diff > 0) {
              document.getElementById(supervisor.host + supervisor.port).style.top =
                parseInt(document.getElementById(supervisor.host + supervisor.port).style.top.replace('px', '')) + diff + 'px';
            }
            if (diffH > 0) {
              document.getElementById(supervisor.host + supervisor.port).style.left =
                parseInt(document.getElementById(supervisor.host + supervisor.port).style.left.replace('px', '')) + diffH + 'px';
            }

            supervisor.masters.forEach(function (master, index) {
              if (diff > 0) {
                document.getElementById(master.host + master.port).style.top =
                  parseInt(document.getElementById(master.host + master.port).style.top.replace('px', '')) + diff + 'px';
              }
              if (diffH > 0) {
                document.getElementById(master.host + master.port).style.left =
                  parseInt(document.getElementById(master.host + master.port).style.left.replace('px', '')) + diff + 'px';
              }

            })
          });

          self.clusterStatusData.members.masters.forEach(function (master, index) {
            if (diff > 0) {
              document.getElementById(master.host + master.port).style.top =
                parseInt(document.getElementById(master.host + master.port).style.top.replace('px', '')) + diff + 'px';
            }
            if (diffH > 0) {
              document.getElementById(master.host + master.port).style.left =
                parseInt(document.getElementById(master.host + master.port).style.left.replace('px', '')) + diff + 'px';
            }

          });
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
       let self  = this;
      var dLLeft = 0;
      var dLTop = 0;
      var dTop = 0;
      var dLeft = 0;
      var sWidth = 0;
      var clusterStatusContainer = document.getElementById('masterContainer');
      if (!self.clusterStatusData.supervisors) {
        return;
      }

      if (self.clusterStatusData.supervisors.length <= 0) {
        drawForRemainings();
      }

      self.clusterStatusData.supervisors.forEach( function (supervisor, sIndex) {
        var clusterStatusContainer = document.getElementById('clusterStatusContainer');


        var supervisorRect = document.getElementById(supervisor.host + supervisor.port);
        if (!supervisorRect) {
          return;
        }

        clearInterval(this.interval);

        var sLeft = supervisorRect.offsetLeft;
        var sTop = supervisorRect.offsetTop;
        var sWidth = supervisorRect.clientWidth;
        var sHeight = supervisorRect.clientHeight;

        var databaseRect = document.getElementById('database');
        dTop = databaseRect.offsetTop;
        dLeft = databaseRect.offsetLeft;

        supervisor.masters.forEach( function (master, index) {
          var masterRect = document.getElementById(master.host + master.port);

          var vMargin = self.vMargin;


          var mLeft = masterRect.offsetLeft;
          var mTop = masterRect.offsetTop;
          var offset = 20;

          var width = sLeft - mLeft + offset;
          var top = sTop + (sHeight / 2);
          var left = mLeft - offset;
          var mHeight = masterRect.clientHeight;
          var height = (mTop + mHeight / 2) - (sTop + sHeight / 2);

          if (sLeft < mLeft) {
            left = sLeft + sWidth;
            width = mLeft - sLeft + offset;
          }


          var node = document.createElement('div');
          dLLeft = mLeft + sWidth / 2;
          if (index != 0) {
            dLTop = dLTop - 10;
          } else {
            dLTop = dTop + databaseRect.clientHeight / 2;
          }

          if (dLTop < dTop) {


            databaseRect.style.setProperty('height', databaseRect.offsetHeight + 10 + 'px');
            databaseRect.style.setProperty('top', databaseRect.offsetTop - 10 + 'px');
          }

          node.setAttribute('class', 'h-line');
          node.setAttribute('id', '&&' + master.host + master.port + '&&database01');
          node.style.setProperty('top', dLTop + 'px');
          node.style.setProperty('left', dLLeft + 'px');
          node.style.setProperty('width', dLeft - mLeft - sWidth / 2 + 'px');
          node.setAttribute('[ngStyle]', '{"border":(clusterStatusData.supervisor[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'UNREACHABLE\'?\'1px dashed #f44455\':\'1px dashed #D9D9D9\')}');
          clusterStatusContainer.appendChild(node);
          self.loadComponent();


          var node = document.createElement('div');
          node.setAttribute('id', '&&' + master.host + master.port + '&&database02');
          node.setAttribute('class', 'h-line ');
          node.style.setProperty('top', dLTop + 'px');
          node.style.setProperty('left', dLLeft + 'px');
          node.style.setProperty('width', '1px');
          node.style.setProperty('height', mTop - dLTop + 'px');
          node.setAttribute('[ngStyle]', '{"border":(clusterStatusData.supervisor[\'' + sIndex + '\'].masters[\'' + index + '\'].state._text==\'UNREACHABLE\'?\'1px dashed #f44455\':\'1px dashed #D9D9D9\')}');
          clusterStatusContainer.appendChild(node);
          self.loadComponent();


          var lNoConnection = '#D9D9D9';

          if (supervisor.data.jobscheduler.state && supervisor.data.jobscheduler.state._text.toLowerCase() == 'unreachable') {
            lNoConnection = '#eb8814';


          }
          var node = document.createElement('div');
          node.setAttribute('id', '&&' + supervisor.host + supervisor.port + '&&' + master.host + master.port + '01');
          node.setAttribute('class', 'h-line');
          node.style.setProperty('top', top + 'px');
          node.style.setProperty('left', left + 'px');
          node.style.setProperty('width', width + 'px');
          node.style.setProperty('border', '1px solid ' + lNoConnection);
          clusterStatusContainer.appendChild(node);
          if (sLeft < mLeft) {
            left = left + width;
          }
          var node = document.createElement('div');
          node.setAttribute('id', '&&' + supervisor.host + supervisor.port + '&&' + master.host + master.port + '02');
          node.setAttribute('class', 'h-line');
          node.style.setProperty('top', top + 'px');
          node.style.setProperty('left', left + 'px');
          node.style.setProperty('width', 1 + 'px');
          node.style.setProperty('height', height + 'px');
          node.style.setProperty('border', '1px solid ' + lNoConnection);
          clusterStatusContainer.appendChild(node);
          if (sLeft < mLeft) {
            left = left - offset;
          }
          var node = document.createElement('div');
          node.setAttribute('id', '&&' + supervisor.host + supervisor.port + '&&' + master.host + master.port + '03');
          node.setAttribute('class', 'h-line');
          node.style.setProperty('top', top + height + 'px');
          node.style.setProperty('left', left + 'px');
          node.style.setProperty('width', 1 + 'px');
          node.style.setProperty('width', offset + 'px');
          node.style.setProperty('border', '1px solid ' + lNoConnection);
          clusterStatusContainer.appendChild(node);

          if (index == supervisor.masters.length - 1) {
            drawForRemainings();
          }
        })
      });

      function drawForRemainings() {
        if (!self.clusterStatusData.members) {
          return;
        }

        self.clusterStatusData.members.masters.forEach(function (master, index) {
          var masterRect = document.getElementById(master.host + master.port);
          if (masterRect) {
            clearInterval(this.interval)
          }
          var vMargin = self.vMargin;

          if (masterRect) {
            var mLeft = masterRect.offsetLeft;
            var mTop = masterRect.offsetTop;
          }

          var databaseRect = document.getElementById('database');
          if (!databaseRect) {
            return;
          }
          dTop = databaseRect.offsetTop;
          dLeft = databaseRect.offsetLeft;
          var offset = 20;
          if (masterRect) {
            sWidth = masterRect.offsetWidth;
          }
          dLLeft = mLeft + sWidth / 2;
          if (dLTop == 0) {
            dLTop = mTop - vMargin / 2;
            dLLeft = mLeft + sWidth / 2;

          } else {
            dLTop = dLTop - 10;
          }


          var node = document.createElement('div');
          node.setAttribute('id', '&&' + master.host + master.port + '&&database01');
          node.setAttribute('class', 'h-line');

          node.style.setProperty('top', dLTop + 'px');
          node.style.setProperty('left', dLLeft + 'px');
          node.style.setProperty('height', '1px');
          node.style.setProperty('width', dLeft - mLeft - sWidth / 2 + 'px');
          node.setAttribute('[ngStyle]', '{"border":(clusterStatusData.members.masters[\'' + index + '\'].state._text==\'UNREACHABLE\'?\'1px dashed #f44455\': \'1px dashed #D9D9D9\')}');
          clusterStatusContainer.appendChild(node);
          self.loadComponent();

          var node = document.createElement('div');
          node.setAttribute('id', '&&' + master.host + master.port + '&&database02');
          node.setAttribute('class', 'h-line');
          node.style.setProperty('top', dLTop + 'px');
          node.style.setProperty('left', dLLeft + 'px');
          node.style.setProperty('width', '1px');
          node.style.setProperty('height', mTop - dLTop + 'px');
          node.setAttribute('[ngStyle]', '{"border":(clusterStatusData.members.masters[\'' + index + '\'].state._text==\'UNREACHABLE\'?\'1px dashed #f44455\':\'1px dashed #D9D9D9\')}');
          clusterStatusContainer.appendChild(node);
          self.loadComponent();

        })
      }
         console.log(this.template)
    }

    /*  ------------------ Actions -----------------------*/
    clusterAction(type){

    }

}
