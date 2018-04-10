import { Component, OnInit, Input } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CoreService } from '../../../services/core.service';
import { AuthService } from '../../../components/guard/auth.service';
import { saveAs } from 'file-saver/FileSaver';

@Component({
    selector: 'app-action',
    templateUrl: './action.component.html',
    styleUrls: ['./action.component.css']
})
export class ActionComponent implements OnInit {

    @Input() master:any;
    userPreferences:any = {};
    schedulerIds:any;

    constructor(public modalService:NgbModal, private coreService:CoreService, private authService:AuthService) {
    }

    ngOnInit() {
        if (sessionStorage.preferences)
            this.userPreferences = JSON.parse(sessionStorage.preferences);
        if (this.authService.scheduleIds) {
            this.schedulerIds = JSON.parse(this.authService.scheduleIds);
        } else {
            this.schedulerIds = {};
        }
    }

    clusterAction(action, data) {
        let obj = {
            jobschedulerId: data.jobschedulerId || this.schedulerIds.selected,
            host: data.host,
            port: data.port,
            auditLog: this.userPreferences.auditLog ? {} : null
        };
        if (action === 'terminateAndRestartWithin' || action === 'terminateWithin') {
            this.getTimeout(action, obj);
        } else if (this.userPreferences.auditLog && (action !== 'downloadLog')) {
            let comments = {
                radio: 'predefined',
                name: obj.jobschedulerId + ' (' + obj.host + ':' + obj.port + ')',
                operation: action === "terminateFailsafe" ? "Terminate and fail-over" : action === "terminateAndRestart" ? "Terminate and Restart" : action === "abortAndRestart" ? "Abort and Restart" : action === "terminate" ? "Terminate" : action === "pause" ? "Pause" : action === "abort" ? "Abort" : action === "remove" ? "Remove instance" : "Continue"
            };

            const modalRef = this.modalService.open(CommentModal, {backdrop: "static"});
            modalRef.componentInstance.comments = comments;
            modalRef.componentInstance.action = action;
            modalRef.componentInstance.show = true;
            modalRef.componentInstance.obj = obj;
            modalRef.componentInstance.performAction = this.performAction;

            modalRef.result.then((result) => {
                console.log('Close...', result)
            }, (reason) => {
                console.log('close...', reason)
            });

        } else {
            this.performAction(action, obj);
        }
    }

    private postCall(url, obj) {
        this.coreService.post(url, obj).subscribe(res=> {
        });
    }

    private getTimeout(action, obj) {
        let comments = {
            radio: 'predefined'
        };

        const modalRef = this.modalService.open(CommentModal, {backdrop: "static"});
        modalRef.componentInstance.comments = comments;
        modalRef.componentInstance.action = action;
        modalRef.componentInstance.show = this.userPreferences.auditLog;
        modalRef.componentInstance.jobScheduleID = obj.jobschedulerId + ' (' + obj.host + ':' + obj.port + ')';
        modalRef.componentInstance.obj = obj;

        modalRef.result.then((result) => {
            console.log('close...', result)
        }, (reason) => {
            console.log('close...', reason)
        });
    }

    performAction(action, obj):void {
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
            })
        } else if (action === 'downloadLog') {
            this.coreService.get('jobscheduler/log?host=' + obj.host + '&jobschedulerId=' + obj.jobschedulerId + '&port=' + obj.port).subscribe((res)=> {
                this.saveToFileSystem(res, obj);
            }, err => {
                console.log('err in download')
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


@Component({
    selector: 'ngbd-modal-content',
     templateUrl: './dialog.html',
})

export class CommentModal implements  OnInit {
    @Input() action;
    @Input() performAction;
    submitted:boolean = false;
    messageList:any;
    required:boolean = false;

    constructor(public activeModal:NgbActiveModal, public coreService:CoreService) {
    }

    ngOnInit() {
        if (sessionStorage.comments)
            this.messageList = JSON.parse(sessionStorage.comments);
        if (sessionStorage.$SOS$FORCELOGING == 'true') {
            this.required = true;
        }
    }

    onSubmit(result, obj):void {
        this.submitted = true;
        obj.auditLog = {
            comment: result.comment,
            timeSpent: result.timeSpent,
            ticketLink: result.ticketLink
        };
        if (this.action === 'terminateAndRestartWithin' || this.action === 'terminateWithin') {
            obj.timeout = result.timeout;
            let url = 'jobscheduler/terminate';
            if (this.action == 'terminateAndRestartWithTimeout') {
                url = 'jobscheduler/restart';
            }
            this.postCall(url, obj);
        } else {
            this.performAction(this.action, obj);
        }
    }

    postCall(url, obj) {
        this.coreService.post(url, obj).subscribe(res=> {
            this.submitted = false;
            this.activeModal.close();
        }, err => {
            this.submitted = false;
        });
    }
}
