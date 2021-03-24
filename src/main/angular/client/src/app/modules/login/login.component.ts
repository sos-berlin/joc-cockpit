import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import {AboutModalComponent} from '../../components/about-modal/about.component';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  user: any = {};
  schedulerIds: any = {};
  submitted = false;
  rememberMe = false;
  errorMsg = false;
  returnUrl: string;

  constructor(private route: ActivatedRoute, private router: Router, private modalService: NgbModal,
              public coreService: CoreService, private authService: AuthService) {
  }

  ngOnInit() {
    if (localStorage.$SOS$REMEMBER === 'true' || localStorage.$SOS$REMEMBER === true) {
      const urs = AES.decrypt(localStorage.$SOS$FOO.toString(), '$SOSJOBSCHEDULER2');
      const pwd = AES.decrypt(localStorage.$SOS$BOO.toString(), '$SOSJOBSCHEDULER2');
      this.user.userName = urs.toString(Utf8);
      this.user.password = pwd.toString(Utf8);
      this.rememberMe = true;
    }
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (this.returnUrl.match(/login/)) {
      this.returnUrl = '/';
    }
    if (this.authService.accessTokenId) {
      this.router.navigate(['/dashboard']);
    }
    // this.getDefaultConfiguration();
  }

  /*  getDefaultConfiguration() {
      this.coreService.get('configuration/login').subscribe((res: any) => {
        if (res.customLogo && res.customLogo.name) {
          const imgUrl = '../ext/images/' + res.customLogo.name;
          if (res.customLogo.position && res.customLogo.position !== 'BOTTOM') {
            $('#logo-top').append('<img style=\'height: ' + res.customLogo.height + '\' src=\'' + imgUrl + '\'>');
          } else {
            $('#logo-bottom').append('<img style=\'height: ' + res.customLogo.height + '\' src=\'' + imgUrl + '\'>');
          }
        }
      });
    }*/

  private getComments(): void {
    this.coreService.post('joc/properties', {}).subscribe((result: any) => {
      sessionStorage.$SOS$FORCELOGING = result.forceCommentsForAuditLog;
      sessionStorage.comments = JSON.stringify(result.comments);
      sessionStorage.showViews = JSON.stringify(result.showViews);
      sessionStorage.securityLevel = result.securityLevel;
      sessionStorage.defaultProfile = result.defaultProfileAccount;
      sessionStorage.$SOS$COPY = JSON.stringify(result.copy);
      sessionStorage.$SOS$RESTORE = JSON.stringify(result.restore);
    });
  }

  private getPermissions(): void {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    this.coreService.post('authentication/joc_cockpit_permissions', {controllerId: this.schedulerIds.selected}).subscribe((permission) => {
      this.authService.setPermissions(permission);
      this.authService.save();
      if (this.schedulerIds) {
        this.authService.savePermission(this.schedulerIds.selected);
      } else {
        this.authService.savePermission('');
      }
      this.submitted = false;
      this.router.navigateByUrl(this.returnUrl);
    }, () => {
      this.submitted = false;
    });
  }

  private getSchedulerIds(): void {
    this.coreService.post('controller/ids', {}).subscribe((res: any) => {
      if (res && res.controllerIds && res.controllerIds.length > 0) {
        this.authService.setIds(res);
        this.authService.save();
        this.getComments();
        this.getPermissions();
      } else {
        this.coreService.post('controllers/security_level', {}).subscribe((result: any) => {
          this.checkSecurityControllers(result);
        }, () => {
          this.checkSecurityControllers(null);
        });
      }
    }, () => {
      this.navigate();
    });
  }

  private checkSecurityControllers(res) {
    if (res && res.controllers && res.controllers.length > 0) {
      this.getComments();
      this.router.navigate(['/controllers']);
      this.submitted = false;
    } else {
      this.navigate();
    }
  }

  private navigate() {
    this.getComments();
    this.router.navigate(['/start-up']);
    this.submitted = false;
  }

  onSubmit(values): void {
    this.submitted = true;
    this.errorMsg = false;
    this.coreService.post('authentication/login', values).subscribe((data) => {
      this.authService.rememberMe = this.rememberMe;
      if (this.rememberMe) {
        const urs = AES.encrypt(values.userName, '$SOSJOBSCHEDULER2');
        const pwd = AES.encrypt(values.password, '$SOSJOBSCHEDULER2');
        localStorage.$SOS$FOO = urs;
        localStorage.$SOS$BOO = pwd;
        localStorage.$SOS$REMEMBER = this.rememberMe;
      } else {
        localStorage.removeItem('$SOS$FOO');
        localStorage.removeItem('$SOS$BOO');
        localStorage.removeItem('$SOS$REMEMBER');
      }
      this.authService.setUser(data);
      this.authService.save();
      this.getSchedulerIds();
    }, () => {
      this.submitted = false;
      this.errorMsg = true;
    });
  }

  about(): any {
    const modalRef = this.modalService.open(AboutModalComponent, {
      backdrop: 'static'
    });
    modalRef.result.then(() => {
    }, () => {
    });
  }
}
