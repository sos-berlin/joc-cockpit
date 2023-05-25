import {Component, OnInit, Renderer2} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import {isArray} from "underscore";
import jwkToPem from "jwk-to-pem";
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
  oidcIdentityServiceItems = [];
  fido2IdentityServiceItems = [];
  showRegister = false;
  showLogin = false;

  constructor(private route: ActivatedRoute, private router: Router, public coreService: CoreService,
              private authService: AuthService, private oAuthService: OIDCAuthService, private renderer: Renderer2,
              private translate: TranslateService, private toasterService: ToastrService) {
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
    } else if (this.showLogin) {
      this.signIn();
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
    if (window.PublicKeyCredential) {
      this.showRegister = true;
      this.errorMsg = false;
      this.errorMsgText = '';
      this.user.userName = '';
      this.identityServiceName = identityServiceName;
    } else {
      let title = '';
      let msg = '';
      this.translate.get('register.message.updateToModernBrowser').subscribe(translatedValue => {
        msg = translatedValue;
      });
      this.translate.get('register.message.browseDoesnotSupportWebAuthn').subscribe(translatedValue => {
        title = translatedValue;
      });
      this.toasterService.warning(msg,
        title);
    }
  }

  register() {
    this.submitted1 = true;
    this.coreService.post('iam/fido2registration/request_registration_start', {
      identityServiceName: this.identityServiceName,
      accountName: this.user.userName,
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
    let id = new Uint8Array(32);

    let publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge: Uint8Array.from(atob(btoa(res.challenge)), c => c.charCodeAt(0)),
      rp: {
        id: window.location.hostname,
        name: 'JS7'
      },
      user: {
        id: id,
        name: this.user.userName,
        displayName: this.user.email
      },
      pubKeyCredParams: [
        {type: "public-key", alg: -7}, {type: "public-key", alg: -257}
      ],
      timeout: res.fido2Properties?.iamFido2Timeout || 60000,
      authenticatorSelection: {
        authenticatorAttachment: "cross-platform",
        userVerification: res.fido2Properties?.iamFido2UserVerification?.toLowerCase() || "preferred"
      },
      extensions: {"credProps": true},
      attestation: res.fido2Properties?.iamFido2Attestation?.toLowerCase() || "direct"
    };

    //  const publicKeyCredentialCreationOptions: any = await response.json();
    navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    }).then((credential: any) => {
      const utf8Decoder = new TextDecoder('utf-8');
      const utf8Encoder = new TextEncoder();
      let decodedClientData: any = utf8Decoder.decode(
        credential.response.clientDataJSON);
      // parse the string as an object
      decodedClientData = JSON.parse(decodedClientData);
      decodedClientData.challenge = res.challenge;
      delete decodedClientData['other_keys_can_be_added_here'];
      let clientDataJSON = utf8Encoder.encode(JSON.stringify(decodedClientData))

      const publicKey = this.getPublicKey(credential.response.attestationObject);
      this.coreService.post('iam/fido2registration/request_registration', {
        identityServiceName: this.identityServiceName,
        accountName: this.user.userName,
        email: this.user.email,
        publicKey: (publicKey),
        clientDataJSON: this.bufferToBase64Url(clientDataJSON),
        credentialId: this.bufferToBase64Url(credential.rawId)
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
    this.showRegister = false;
    this.showLogin = false;
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
    this.showLogin = true;
    this.identityServiceName = data;
    this.user.userName = '';
  }

  signIn(): void {
    this.errorMsgText = '';
    this.coreService.post('iam/fido2/request_authentication', {
      identityServiceName: this.identityServiceName,
      accountName: this.user.userName,
    }).subscribe({
      next: (res) => {
        console.log(res);
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

  private getCredentials(res): void {
    let publicKey: PublicKeyCredentialRequestOptions = {
      challenge: Uint8Array.from(atob(btoa(res.challenge)), c => c.charCodeAt(0)),
      allowCredentials: [{
        id: Uint8Array.from(atob((res.credentialId)), c => c.charCodeAt(0)),
        type: 'public-key',
        transports: res.fido2Properties?.iamFido2Transports ? (isArray(res.fido2Properties?.iamFido2Transports) ? res.fido2Properties?.iamFido2Transports : [res.fido2Properties?.iamFido2Transports]) : []
      }],
      timeout: res.fido2Properties?.iamFido2Timeout || 60000,
    };
    navigator.credentials.get({'publicKey': publicKey})
      .then((getAssertionResponse: Credential) => {
        this.fido2Authenticate(getAssertionResponse);
      })
      .catch((error) => {
        this.errorMsg = true;
        this.errorMsgText = error;
      })
  }

  private fido2Authenticate(getAssertionResponse): void {
    const headers = new HttpHeaders({
      'X-AUTHENTICATOR-DATA': this.bufferToBase64Url(getAssertionResponse.response.authenticatorData),
      'X-CLIENT-DATA-JSON': this.bufferToBase64Url(getAssertionResponse.response.clientDataJSON),
      'X-SIGNATURE': this.bufferToBase64Url(getAssertionResponse.response.signature),
      'X-IDENTITY-SERVICE': this.identityServiceName,
      'Authorization': 'Basic ' + window.btoa(decodeURIComponent(encodeURIComponent(this.user.userName)))
    });
    this.coreService.log('authentication/login', {fido2: true}, {headers}).subscribe({
      next: (data) => {
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

  // Get public key from attestation object

  private getPublicKey(attestationObject: any): any {
    const decodedAttestationObject = window['CBOR'].decode(
      attestationObject);
    const {authData} = decodedAttestationObject;

    // get the length of the credential ID
    const dataView = new DataView(
      new ArrayBuffer(2));
    const idLenBytes = authData.slice(53, 55);
    idLenBytes.forEach(
      (value, index) => dataView.setUint8(
        index, value));
    const credentialIdLength = dataView.getUint16(0);

    // get the public key object
    const publicKeyBytes = authData.slice(
      55 + credentialIdLength);

    // the publicKeyBytes are encoded again as CBOR
    const publicKeyObject = window['CBOR'].decode(
      publicKeyBytes.buffer);

    let publicKeyJwk = COSEtoJWK(publicKeyObject);

    function convertToPEM(curve, x, y) {
      // Create a JWK (JSON Web Key) object from the public key components
      const jwk = {
        crv: curve,
        kty: 'EC',
        x: base64urlEncode(x),
        y: base64urlEncode(y)
      };

      // Convert the JWK to PEM format
      const pem = jwkToPem(jwk);

      // Return the PEM-formatted public key
      return pem;
    }

    // Function to base64url encode data
    function base64urlEncode(data) {
      const base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(data)));
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    // Function to convert COSE format to JWK format
    function COSEtoJWK(parsedCoseKey) {

      const COSE_ALGORITHM_LABEL = 3;

      // Extract the values from the COSE public key
      const algorithm = parsedCoseKey[COSE_ALGORITHM_LABEL];

      // Set the specific key parameters based on the algorithm and public key values
      if (algorithm === -7) {
        return convertToPEM('P-256', parsedCoseKey[-2], parsedCoseKey[-3]);
        // ECDSA algorithm
      } else if (algorithm === -257) {
        // RSASSA-PKCS1-v1_5 algorithm
        return convertToPEM('P-256', parsedCoseKey[-2], parsedCoseKey[-3]);
      }
    }
    return publicKeyJwk; // The extracted public key in JWK format
  }
}
