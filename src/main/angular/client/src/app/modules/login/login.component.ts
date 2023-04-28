import {Component, OnInit, Renderer2} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
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
  defaultSetting: any = {};
  oidcIdentityServiceItems = [];
  fido2IdentityServiceItems = [];
  showRegister = false;

  constructor(private route: ActivatedRoute, private router: Router, public coreService: CoreService,
              private authService: AuthService, private oAuthService: OIDCAuthService, private renderer: Renderer2) {
  }

  ngOnInit(): void {
    this.loadProviders();
    this.getDefaultConfiguration();
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
        this.fido2IdentityServiceItems = res.fido2ServiceItems || [];
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
    }
    this.submitted = true;
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
    sessionStorage.authConfig = JSON.stringify(config);
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
    this.coreService.post('iam/identityclient', { identityServiceName }).subscribe({
      next: (data) => {
        this.oAuthService.clientId = data.iamOidcClientId;
        this.oAuthService.clientSecret = data.iamOidcClientSecret;
        sessionStorage.setItem('clientId', data.iamOidcClientId);
        sessionStorage.setItem('clientSecret', data.iamOidcClientSecret);
        this.oAuthService.initLoginFlow();
      }
    });
  }


  idList: any = [];

  registerDevice() {
    this.showRegister = true;
    this.errorMsg = false;
    this.errorMsgText = '';
    this.coreService.post('iam/identityclient', { identityServiceName: this.fido2IdentityServiceItems[0].identityServiceName }).subscribe({
      next: (data) => {
        console.log(data)
      }
    });
  }

  register() {
    this.submitted1 = true;
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);
    let id = new Uint8Array(32);
    let publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge: challenge,
      rp: {
        name: 'SOS'
      },
      user: {
        id: id,
        name: this.user.email,
        displayName: this.user.displayName
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }
      ],
      authenticatorSelection: {
        // authenticatorAttachment: "platform", // "cross-platform" | "platform"
        // requireResidentKey: false,
        userVerification: "preferred", // "discouraged" | "preferred" | "required"
        // specify the allowed AuthenticatorTransport types here
        //  residentKey: "preferred" // "discouraged" | "preferred" | "required";
      },
      timeout: 60000,
      attestation: "none", // "direct" | "enterprise" | "indirect" | "none"
      // PublicKeyCredentialDescriptor[] { id: BufferSource,  transports?: ["ble" | "hybrid" | "internal" | "nfc" | "usb"], type: "public-key";

    };


    //  const publicKeyCredentialCreationOptions: any = await response.json();

    navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    }).then((credential: any) => {

      // Send the credential to the back-end for verification
      console.log(credential)
      const credentialData = {
        id: credential.id,
        type: credential.type,
        rawId: this.bufferToBase64Url(credential.rawId),
        response: {
          clientDataJSON: this.bufferToBase64Url(credential.response.clientDataJSON),
          attestationObject: this.bufferToBase64Url(credential.response.attestationObject)
        }
      };

      //TODO
      console.log(credentialData, ' Save in DB')
      let enc = new TextDecoder("utf-8");
      let clientDataJSON = enc.decode(credential.response.clientDataJSON);

      console.log(clientDataJSON);
      let clientData = JSON.parse(clientDataJSON);
      console.log(clientData);
      this.coreService.post('/iam/fido2registration/requestregistration', {
        "identityServiceName": this.fido2IdentityServiceItems[0].identityServiceName,
        "accountName": this.user.displayName,
        "rpName": "myRpName",
        "email": this.user.email,
        "publicKey": this.user.displayName
      }).subscribe({
        next: () => {
          this.submitted1 = false;
          this.back();
        }, error: () => {
          this.submitted1 = false;
        }
      })
    })
      .catch((error) => {
        this.submitted1 = false;
        this.errorMsg = true;
        this.errorMsgText = error;
        console.log('FAIL', error)
      })
  }

  back(): void {
    this.showRegister = false;
    this.submitted = false;
    this.submitted1 = false;
    this.errorMsg = false;
    this.errorMsgText = '';
  }


  private bufferToBase64Url(buffer: any) {
    const base64String = btoa(String.fromCharCode(...new Uint8Array(buffer)))
    base64String.replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return base64String;
  }

  onSign(data) {
    console.log(data)
    this.errorMsgText = '';
    let challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);
    let publicKey: PublicKeyCredentialRequestOptions = {
      challenge: challenge,
      allowCredentials: this.idList
    }
    console.log(publicKey);

    navigator.credentials.get({ 'publicKey': publicKey })
      .then((getAssertionResponse) => {
        alert('SUCCESSFULLY LOGIN!');
        console.log('SUCCESSFULLY LOGIN!', getAssertionResponse)
      })
      .catch((error) => {
        this.errorMsg = true;
        this.errorMsgText = error;
      })
  }
}
