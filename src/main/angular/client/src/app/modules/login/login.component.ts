import {Component, OnInit, Renderer2} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import {isArray} from "underscore";
import {HttpHeaders} from "@angular/common/http";
import {CoreService} from '../../services/core.service';
import {AuthService, OIDCAuthService} from '../../components/guard';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user: any = {};
  schedulerIds: any = {};
  submitted = false;
  submitted1 = false;
  rememberMe = false;
  errorMsg = false;
  returnUrl = '';
  errorMsgText = '';
  identityServiceName = '';
  defaultSetting: any = {};
  fidoProperties: any = {};
  oidcIdentityServiceItems = [];
  fidoIdentityServiceItems = [];
  fido2ndFactorServiceItems = [];
  showRegister = false;
  showLogin = false;
  userObject: any = {};

  constructor(private route: ActivatedRoute, private router: Router, public coreService: CoreService,
              private authService: AuthService, private oAuthService: OIDCAuthService, private renderer: Renderer2,
              private translate: TranslateService, private toasterService: ToastrService) {
  }

  ngOnInit(): void {
    this.loadProviders();
    this.getDefaultConfiguration();
    if (localStorage['$SOS$REMEMBER'] === 'true' || localStorage['$SOS$REMEMBER'] === true) {
      if (localStorage['$SOS$FOO']) {
        const urs = AES.decrypt(localStorage['$SOS$FOO'].toString(), '$SOSJS7');
        this.user.userName = urs.toString(Utf8);
        if (localStorage['$SOS$BOO']) {
          const pwd = AES.decrypt(localStorage['$SOS$BOO'].toString(), '$SOSJS7');
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

  private getDefaultConfiguration() {
    this.coreService.post('configuration/login', {}).subscribe({
      next: (res) => {
        this.defaultSetting = res;
        if (!res.enableRememberMe) {
          localStorage.removeItem('$SOS$FOO');
          localStorage.removeItem('$SOS$BOO');
          localStorage.removeItem('$SOS$REMEMBER');
          this.rememberMe = false;
          this.user = {};
        }
        if (res.title) {
          document.title = 'JS7: ' + res.title;
        }
        if (res.customLogo && res.customLogo.name) {
          let imgUrl = '../ext/images/' + res.customLogo.name;
          const imgContainer = this.renderer.createElement('img');
          // Set the id of the div
          this.renderer.setProperty(imgContainer, 'src', imgUrl);
          this.renderer.setProperty(imgContainer, 'style', 'height: ' + res.customLogo.height || '140px');
          const elem: any = document.getElementsByClassName('login-box');
          if (elem.length > 0) {
            let logHt = (res.customLogo.height || '140px').replace(/^\D+/g, '');
            let ht = (window.innerHeight - document.getElementById('center-block')?.clientHeight);

            if (ht < parseInt(logHt)) {
              elem[0].style.height = 'calc(100% + ' + (parseInt(logHt)) + 'px)';
            }
          }
          const dom = document.getElementById(res.customLogo.position && res.customLogo.position.match('top') ? 'logo-top' : 'logo-bottom');
          if (dom) {
            // Append the created div to the body element
            this.renderer?.appendChild(dom, imgContainer);
          }
        }
      }
    })
  }

  private loadProviders(): void {
    this.coreService.post('iam/identityproviders', {}).subscribe({
      next: (res) => {
        this.oidcIdentityServiceItems = res.oidcServiceItems || [];
        this.fidoIdentityServiceItems = res.fidoServiceItems || [];
        this.fido2ndFactorServiceItems = res.fido2ndFactorServiceItems || [];
      }, error(err) {
        console.error(err)
      },
    })
  }

  onSubmit(values: any): void {
    this.errorMsg = false;
    this.errorMsgText = '';
    if (this.showRegister) {
      this.register();
      return;
    } else if (this.showLogin) {
      this.signIn();
      return;
    }
    this.submitted = true;
    this.coreService.post('authentication/login', values).subscribe({
      next: (data: any) => {
        this.authService.rememberMe = this.rememberMe;
        if (this.rememberMe) {
          if (values.userName) {
            localStorage['$SOS$FOO'] = AES.encrypt(values.userName, '$SOSJS7');
          } else {
            localStorage.removeItem('$SOS$FOO');
          }
          if (values.password) {
            localStorage['$SOS$BOO'] = AES.encrypt(values.password, '$SOSJS7');
          } else {
            localStorage.removeItem('$SOS$BOO');
          }
          localStorage['$SOS$REMEMBER'] = this.rememberMe;
        } else {
          localStorage.removeItem('$SOS$FOO');
          localStorage.removeItem('$SOS$BOO');
          localStorage.removeItem('$SOS$REMEMBER');
        }

        if (data.accessToken === '' && data.isAuthenticated && data.secondFactoridentityService) {
          this.userObject = {
            userName: values.userName,
            password: values.password,
            identityService: data.identityService
          };
          this.submitted = false;
          this.onSign(data.secondFactoridentityService)
          return;
        }
        this.authService.setUser(data);
        this.authService.save();
        if (this.returnUrl.indexOf('?') > -1) {
          this.router.navigateByUrl(this.returnUrl).then();
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
    sessionStorage['authConfig'] = JSON.stringify(config);
    // Tweak config for code flow
    this.oAuthService.configure(config);
    this.oAuthService.loadDiscoveryDocument().then((_) => {
      sessionStorage.setItem('authConfig', JSON.stringify(config));
      sessionStorage.setItem('providerName', config.identityServiceName);
      if (this.returnUrl) {
        sessionStorage.setItem('returnUrl', this.returnUrl);
      }
      this.getIdAndSecret(config.identityServiceName);
    });
  }

  private getIdAndSecret(identityServiceName): void {
    this.coreService.post('iam/identityclient', {identityServiceName}).subscribe({
      next: (data) => {
        this.oAuthService.clientId = data.iamOidcClientId;
        this.oAuthService.clientSecret = data.iamOidcClientSecret;
        sessionStorage.setItem('clientId', data.iamOidcClientId);
        sessionStorage.setItem('clientSecret', data.iamOidcClientSecret);
        this.oAuthService.initLoginFlow();
      }
    });
  }


  registerDevice(identityServiceName) {
    if (this.coreService.checkConnection()) {
      this.showRegister = true;
      this.errorMsg = false;
      this.errorMsgText = '';
      this.user.userName = '';
      this.user.email = '';
      this.identityServiceName = identityServiceName;
    }
  }

  register() {
    this.submitted1 = true;
    this.errorMsg = false;
    this.errorMsgText = '';
    this.coreService.post('iam/fidoregistration/request_registration_start', {
      identityServiceName: this.identityServiceName,
      accountName: this.user.userName,
      origin: location.origin,
      email: this.user.email
    }).subscribe({
      next: (res) => {
        this.createRegistrationRequest(res);
      }, error: (err) => {
        this.submitted1 = false;
        this.errorMsg = true;
        if (err.error && err.error.error) {
          if (err.error.error.message) {
            err.error.error.message = err.error.error.message.replace('JocBadRequestException:', '');
          }
          this.errorMsgText = err.error.error.message;
        } else {
          this.errorMsgText = err.message;
        }
      }
    });
  }

  private createRegistrationRequest(res) {
    let publicKeyCredentialCreationOptions = this.authService.createPublicKeyCredentialRequest(Uint8Array.from(atob(btoa(res.challenge)), c => c.charCodeAt(0)),
      res.fidoProperties, this.user);
    navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    }).then((credential: any) => {

      const {jwk, publicKey} = this.authService.getPublicKey(credential.response.attestationObject);
      this.coreService.post('iam/fidoregistration/request_registration', {
        identityServiceName: this.identityServiceName,
        accountName: this.user.userName,
        email: this.user.email,
        publicKey: publicKey,
        jwk: jwk,
        clientDataJSON: this.authService.bufferToBase64Url(credential.response.clientDataJSON),
        credentialId: this.authService.bufferToBase64Url(credential.rawId)
      }).subscribe({
        next: () => {
          this.submitted1 = false;
          let title = '';
          let msg = '';
          this.translate.get('register.message.verifyEmailAddress').subscribe(translatedValue => {
            msg = translatedValue;
          });
          this.translate.get('register.message.registrationSuccessful').subscribe(translatedValue => {
            title = translatedValue;
          });
          this.toasterService.success(msg, title)
          this.back();
        }, error: (err) => {
          this.submitted1 = false;
          if (err.error && err.error.error) {
            this.toasterService.error(err.error.error.message);
          } else {
            this.toasterService.error(err.message);
          }
        }
      })
    }).catch((error) => {
      this.submitted1 = false;
      this.errorMsg = true;
      this.errorMsgText = error;
    })
  }

  back(): void {
    this.identityServiceName = '';
    this.user.userName = '';
    this.user.email = '';
    this.showRegister = false;
    this.showLogin = false;
    this.submitted = false;
    this.submitted1 = false;
    this.errorMsg = false;
    this.errorMsgText = '';
  }

  onSign(data) {
    this.identityServiceName = data;
    this.user.userName = '';
    this.user.email = '';
    this.coreService.post('iam/identity_fido_client', {
      identityServiceName: this.identityServiceName
    }).subscribe((res) => {
      this.fidoProperties = res;
      if (!res.iamFidoRequireAccount) {
        this.signIn();
      } else {
        this.showLogin = true;
      }
    });
  }

  signIn(): void {
    if (this.coreService.checkConnection()) {
      this.errorMsg = false;
      this.errorMsgText = '';
      this.coreService.post('iam/fido/request_authentication', {
        identityServiceName: this.identityServiceName,
        origin: location.origin,
        accountName: this.user.userName ? this.user.userName : undefined,
      }).subscribe({
        next: (res) => {
          this.getCredentials(res);
        }, error: (err) => {
          this.errorMsg = true;
          if (err.error && err.error.error) {
            this.errorMsgText = err.error.error.message;
          } else {
            this.errorMsgText = err.message;
          }
        }
      })
    }
  }

  private getCredentials(res): void {
    let allowCredentials = [];
    if (res.credentialIds && isArray(res.credentialIds)) {
      res.credentialIds.forEach((item) => {
        allowCredentials.push({
          id: Uint8Array.from(atob((item)), c => c.charCodeAt(0)),
          type: 'public-key',
          transports: this.fidoProperties?.iamFidoTransports ? (isArray(this.fidoProperties?.iamFidoTransports) ? this.fidoProperties?.iamFidoTransports : [this.fidoProperties?.iamFidoTransports]) : []
        })
      })
    }

    let publicKey: PublicKeyCredentialRequestOptions = {
      challenge: Uint8Array.from(atob(btoa(res.challenge)), c => c.charCodeAt(0)),
      allowCredentials: allowCredentials,
      rpId: window.location.hostname,
      timeout: this.fidoProperties?.iamFidoTimeout ? this.fidoProperties?.iamFidoTimeout * 1000 : 60000,
      userVerification: this.fidoProperties?.iamFidoUserVerification?.toLowerCase() || "preferred"
    };

    navigator.credentials.get({'publicKey': publicKey})
      .then((getAssertionResponse: Credential) => {
        this.fidoAuthenticate(getAssertionResponse, res.requestId + '');
      })
      .catch((error) => {
        this.errorMsg = true;
        this.errorMsgText = error;
      })
  }

  private fidoAuthenticate(getAssertionResponse, requestId): void {
    let obj: any = {
      'X-AUTHENTICATOR-DATA': this.authService.bufferToBase64Url(getAssertionResponse.response.authenticatorData),
      'X-CLIENT-DATA-JSON': this.authService.bufferToBase64Url(getAssertionResponse.response.clientDataJSON),
      'X-SIGNATURE': this.authService.bufferToBase64Url(getAssertionResponse.response.signature),
      'X-IDENTITY-SERVICE': this.identityServiceName,
      'X-REQUEST-ID': requestId,
      'X-CREDENTIAL-ID': this.authService.bufferToBase64Url(getAssertionResponse.rawId)
    };

    if (this.userObject.userName && this.userObject.identityService) {
      obj['X-1ST-IDENTITY-SERVICE'] = this.userObject.identityService.substring(this.userObject.identityService.lastIndexOf(':') + 1);
    }
    let headers = new HttpHeaders(obj);
    this.coreService.log('authentication/login', this.userObject.userName ? this.userObject : {fido: true}, {headers}).subscribe({
      next: (data: any) => {
        this.authService.setUser(data);
        this.authService.save();
        if (this.returnUrl.indexOf('?') > -1) {
          this.router.navigateByUrl(this.returnUrl).then();
        } else {
          this.router.navigate([this.returnUrl]).then();
        }
      }, error: (err) => {
        this.submitted = false;
        this.errorMsg = true;
      }
    });
  }
}
