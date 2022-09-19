import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import { CoreService } from '../../services/core.service';
import { AuthService } from '../../components/guard';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user: any = {};
  schedulerIds: any = {};
  submitted = false;
  rememberMe = false;
  errorMsg = false;
  returnUrl = '';
  identityServiceItems = [];

  constructor(private route: ActivatedRoute, private router: Router, public coreService: CoreService,
    private authService: AuthService, private oAuthService: OAuthService) {
  }

  ngOnInit(): void {
    this.loadProviders();
    if (localStorage.$SOS$REMEMBER === 'true' || localStorage.$SOS$REMEMBER === true) {
      if (localStorage.$SOS$FOO) {
        const urs = AES.decrypt(localStorage.$SOS$FOO.toString(), '$SOSJS7');
        this.user.userName = urs.toString(Utf8);
        if (localStorage.$SOS$BOO) {
          const pwd = AES.decrypt(localStorage.$SOS$BOO.toString(), '$SOSJS7');
          this.user.password = pwd.toString(Utf8);
        }
      }
      this.rememberMe = true;
    }
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (this.returnUrl.match(/login/)) {
      this.returnUrl = '/';
    }
    if (this.authService.accessTokenId) {
      this.router.navigate(['/dashboard']).then();
    }
  }

  private loadProviders(): void {
    this.coreService.post('iam/identityproviders', {}).subscribe({
      next: (res) => {
        this.identityServiceItems = res.identityServiceItems;
      }, error(err) {
        console.log(err)
      },
    })
  }

  onSubmit(values: any): void {
    this.submitted = true;
    this.errorMsg = false;
    this.coreService.post('authentication/login', values).subscribe({
      next: (data) => {
        this.authService.rememberMe = this.rememberMe;
        if (this.rememberMe) {
          if (values.userName) {
            localStorage.$SOS$FOO = AES.encrypt(values.userName, '$SOSJS7');
          } else {
            localStorage.removeItem('$SOS$FOO');
          }
          if (values.password) {
            localStorage.$SOS$BOO = AES.encrypt(values.password, '$SOSJS7');
          } else {
            localStorage.removeItem('$SOS$BOO');
          }
          localStorage.$SOS$REMEMBER = this.rememberMe;
        } else {
          localStorage.removeItem('$SOS$FOO');
          localStorage.removeItem('$SOS$BOO');
          localStorage.removeItem('$SOS$REMEMBER');
        }
        this.authService.setUser(data);
        this.authService.save();
        if (this.returnUrl.indexOf('?') > -1) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.router.navigate([this.returnUrl]).then();
        }
      }, error: () => {
        this.submitted = false;
        this.errorMsg = true;
      }
    });
  }

  loginWithPopup(config) {
    const authCodeFlowConfig: AuthConfig = {
      // Url of the Identity Provider
      issuer: config.iamOidcAuthenticationUrl, 

      // strict discovery document disallows urls which not start with issuers url
      strictDiscoveryDocumentValidation: false,

      // URL of the SPA to redirect the user to after login
      redirectUri: window.location.origin + '/joc',

      // The SPA's id. The SPA is registerd with this id at the auth-server
      // clientId: 'server.code',
      clientId: config.iamOidcClientId,
      dummyClientSecret: config.iamOidcClientSecret,
      // set the scope for the permissions the client should request
      scope: 'openid profile email',
      useSilentRefresh: true,
      responseType: 'code',
      showDebugInformation: true,
    };
    this.loginCodeInPopup(authCodeFlowConfig, config.identityServiceName);

  }

  loginCodeInPopup(authConfig, providerName) {
    sessionStorage.authConfig = JSON.stringify(authConfig);
    // Tweak config for code flow

    this.oAuthService.configure(authConfig);
    this.oAuthService.loadDiscoveryDocument();
    sessionStorage.setItem('authConfig', JSON.stringify(authConfig));
    sessionStorage.setItem('providerName', providerName);
    if (this.returnUrl) {
      sessionStorage.setItem('returnUrl', this.returnUrl);
    }

    this.oAuthService.initLoginFlow();

  }

}
