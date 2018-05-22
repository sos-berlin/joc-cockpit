import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from '../../services/core.service';
import { AuthService } from '../../components/guard';
import * as crypto from 'crypto-js';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    providers: [CoreService]
})
export class LoginComponent implements OnInit {

    user: any ={};
    schedulerIds: any ={};
    submitted = false;
    rememberMe = false;
    errorMsg: string;

    constructor(public router:Router, public coreService:CoreService, public authService:AuthService) {
    }

    ngOnInit() {
        if (localStorage.$SOS$REMEMBER == 'true' || localStorage.$SOS$REMEMBER == true) {
            let urs = crypto.AES.decrypt(localStorage.$SOS$FOO.toString(), '$SOSJOBSCHEDULER2');
            let pwd = crypto.AES.decrypt(localStorage.$SOS$BOO.toString(), '$SOSJOBSCHEDULER2');
            this.user.userName = urs.toString();
            this.user.password = pwd.toString();
            this.rememberMe = true;
        }
    }

    private getComments():void {
      let result: any;
      this.coreService.post('audit_log/comments', {}).subscribe(res => {
        result = res;
        sessionStorage.$SOS$FORCELOGING = result.forceCommentsForAuditLog;
        sessionStorage.comments = JSON.stringify(result.comments);
      });
    }

    private getPermissions():void {
        this.schedulerIds = JSON.parse(this.authService.scheduleIds);
        this.coreService.post('security/joc_cockpit_permissions', {jobschedulerId: this.schedulerIds.selected}).subscribe((permission)=> {
            this.authService.setPermissions(permission);
            this.authService.savePermission(this.schedulerIds.selected);
            this.authService.save();
            this.submitted = false;
            if (localStorage.$SOS$URL) {
                this.router.navigate([localStorage.$SOS$URL]);
                localStorage.removeItem('$SOS$URL');
            } else {
                this.router.navigate(['/']);
            }
        }, ()=> {
            this.submitted = false;
        });
    }

    private getSchedulerIds():void {
        sessionStorage.errorMsg = '';
        this.coreService.post('jobscheduler/ids', {}).subscribe((res) => {
            this.authService.setIds(res);
            this.authService.save();
            this.getComments();
            this.getPermissions();
        }, (err) => {
            if (err.error)
                sessionStorage.errorMsg = err.error.message;
            else if (err.message)
                sessionStorage.errorMsg = err.error;
            else
                sessionStorage.errorMsg = 'Internal server error';
            this.router.navigate(['/error']);
            this.submitted = false;
        });
    }

    onSubmit(values):void {
        this.submitted = true;
        this.errorMsg = '';

        this.coreService.post('security/login', values).subscribe((data) => {
            let userDetail = data;
            this.authService.rememberMe = this.rememberMe;
            if (this.rememberMe) {
                let urs = crypto.AES.encrypt(values.userName, '$SOSJOBSCHEDULER2');
                let pwd = crypto.AES.encrypt(values.password, '$SOSJOBSCHEDULER2');
                localStorage.$SOS$FOO = urs;
                localStorage.$SOS$BOO = pwd;
                localStorage.$SOS$REMEMBER = this.rememberMe;
            } else {
                localStorage.removeItem('$SOS$FOO');
                localStorage.removeItem('$SOS$BOO');
                localStorage.removeItem('$SOS$REMEMBER');
            }
            this.authService.setUser(userDetail);
            this.authService.save();
            this.getSchedulerIds();
        }, () => {
            this.submitted = false;
            this.errorMsg = 'message.loginError'
        });
    }
}
