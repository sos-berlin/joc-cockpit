import {Injectable} from "@angular/core";
import {HttpHeaders, HttpParams} from "@angular/common/http";
import {combineLatest, Observable, of} from "rxjs";
import CryptoJS from 'crypto-js';
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";
import {CoreService} from "../../services/core.service";
import {AuthService} from "./auth.service";


// GENERATING CODE CHALLENGE FROM VERIFIER
function generateCodeChallengeFromVerifier(v: any) {
  return base64URL({string: CryptoJS.SHA256(v)});
}

function base64URL({string}: { string: any }) {
  return string.toString(CryptoJS.enc.Base64).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function base64UrlEncode(str: string) {
  const base64 = btoa(str);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}


@Injectable({
  providedIn: 'root'
})
export class OIDCAuthService {
  clientId?: string = '';
  redirectUri?: string;
  loginUrl?: string = '';
  scope = 'openid profile email';
  issuer?: string;
  logoutUrl?: string;
  tokenEndpoint?: string;
  responseType?: string;
  showDebugInformation?: boolean;
  clientSecret?: string;
  requireHttps?: boolean | 'remoteOnly';
  skipIssuerCheck?: boolean;
  nonceStateSeparator: string = ';';
  state = '';
  responseTypesSupported = [];
  grantTypesSupported = [];
  tokenEndMethodsSupported = [];
  discoveryDocumentLoaded = false;
  access_token: string | undefined;
  id_token: string | undefined;
  refresh_token: string | undefined;

  constructor(private coreService: CoreService, private toasterService: ToastrService, private authService: AuthService,
              private router: Router) {
    if (sessionStorage['$SOS$KEY']) {
      this.coreService.renewLocker(sessionStorage['$SOS$KEY']);
      if (sessionStorage['$SOS$TOKENEXPIRETIME']) {
        this.renewToken();
      }
    }
  }

  configure(config: any) {
    this.issuer = config.iamOidcAuthenticationUrl;
    this.redirectUri = window.location.origin + '/joc';
    this.showDebugInformation = true;
  }

  loadDiscoveryDocument(fullUrl: string | null) {
    return new Promise((resolve, reject) => {
      if (!fullUrl) {
        fullUrl = this.issuer || '';
        if (!fullUrl.endsWith('/')) {
          fullUrl += '/';
        }
        fullUrl += '.well-known/openid-configuration';
      }
      if (!this.validateUrlForHttps(fullUrl)) {
        reject("issuer  must use HTTPS (with TLS), or config value for property 'requireHttps' must be set to 'false' and allow HTTP (without TLS).");
        return;
      } else {
        this.coreService.get(fullUrl).subscribe({
          next: (doc) => {
            if (!this.validateDiscoveryDocument(doc)) {
              this.toasterService.error('discovery_document_validation_error');
              return;
            }
            this.loginUrl = doc.authorization_endpoint;
            this.logoutUrl = doc.revocation_endpoint || doc.end_session_endpoint || '';
            this.issuer = doc.issuer;
            sessionStorage['logoutUrl'] = this.logoutUrl;
            this.grantTypesSupported = doc.grant_types_supported;
            this.tokenEndpoint = doc.token_endpoint;
            this.responseTypesSupported = doc.response_types_supported || ['code'];
            this.tokenEndMethodsSupported = doc.token_endpoint_auth_methods_supported || ['client_secret_post'];
            this.discoveryDocumentLoaded = true;
            const result = {
              discoveryDocument: doc,

            };
            resolve(result);

          }, error: (err) => {
            reject(err);
          }
        });
      }
    });
  }

  private validateDiscoveryDocument(doc: any) {
    let errors: any;
    if (!this.skipIssuerCheck && doc.issuer !== this.issuer) {
      this.toasterService.error('invalid issuer in discovery document, expected: ' + this.issuer, 'current: ' + doc.issuer);
      return false;
    }
    errors = this.validateUrlFromDiscoveryDocument(doc.authorization_endpoint);
    if (errors.length > 0) {
      this.toasterService.error('error validating authorization_endpoint in discovery document', errors);
      return false;
    }
    errors = this.validateUrlFromDiscoveryDocument(doc.end_session_endpoint);
    if (errors.length > 0) {
      this.toasterService.error('error validating end_session_endpoint in discovery document', errors);
      return false;
    }
    errors = this.validateUrlFromDiscoveryDocument(doc.token_endpoint);
    if (errors.length > 0) {
      this.toasterService.error('error validating token_endpoint in discovery document', errors);
    }
    errors = this.validateUrlFromDiscoveryDocument(doc.revocation_endpoint);
    if (errors.length > 0) {
      this.toasterService.error('error validating revocation_endpoint in discovery document', errors);
    }
    errors = this.validateUrlFromDiscoveryDocument(doc.userinfo_endpoint);
    if (errors.length > 0) {
      this.toasterService.error('error validating userinfo_endpoint in discovery document', errors);
      return false;
    }

    return true;
  }

  validateUrlFromDiscoveryDocument(url: string) {
    const errors = [];
    const httpsCheck = this.validateUrlForHttps(url);
    if (!httpsCheck) {
      errors.push('https for all urls required. Also for urls received by discovery.');
    }
    return errors;
  }

  validateUrlForHttps(url: string | undefined) {
    if (!url) {
      return true;
    }
    const lcUrl = url.toLowerCase();
    if (this.requireHttps === false) {
      return true;
    }
    if ((lcUrl.match(/^http:\/\/localhost($|[:\/])/) ||
        lcUrl.match(/^http:\/\/localhost($|[:\/])/)) &&
      this.requireHttps === 'remoteOnly') {
      return true;
    }
    return lcUrl.startsWith('https://');
  }

  private _logout(): void {
    this.coreService.post('authentication/logout', {});
    this.authService.clearUser();
    this.authService.clearStorage();
    localStorage.removeItem('logging');
    this.coreService.setDefaultTab();
    sessionStorage.clear();
    this.router.navigate(['login']).then();
  }


  assertUrlNotNullAndCorrectProtocol(url: string | undefined, description: string) {
    if (!url) {
      throw new Error(`'${description}' should not be null`);
    }
    if (!this.validateUrlForHttps(url)) {
      throw new Error(`'${description}' must use HTTPS (with TLS), or config value for property 'requireHttps' must be set to 'false' and allow HTTP (without TLS).`);
    }
  }

  async createLoginUrl(state = '', noPrompt = false) {
    let redirectUri: string | undefined = this.redirectUri;
    const nonce: any = await this.createAndSaveNonce();
    if (state) {
      state = nonce + this.nonceStateSeparator + encodeURIComponent(state);
    } else {
      state = nonce;
    }

    this.responseType = 'code';
    let url = '';
    if (this.loginUrl) {
      const seperationChar = this.loginUrl.indexOf('?') > -1 ? '&' : '?';
      let scope = this.scope;
      if (!scope.match(/(^|\s)openid($|\s)/)) {
        scope = 'openid ' + scope;
      }
      if(this.responseTypesSupported?.length > 1) {
        this.responseTypesSupported.forEach((type: string) => {
          if (type.includes('id_token')) {
            this.responseType = type;
          }
        })
      }
     
      url = this.loginUrl +
        seperationChar +
        'response_type=' +
        encodeURIComponent(this.responseType) + (this.clientId ? '&client_id=' +  encodeURIComponent(this.clientId) : '') +
        '&state=' +
        encodeURIComponent(state) +
        '&redirect_uri=' +
        encodeURIComponent(redirectUri || '') +
        '&scope=' +
        encodeURIComponent(scope);
      if (this.responseType.includes('code')) {
        const [challenge, verifier] = await this.createChallangeVerifierPairForPKCE();
        if (verifier) {
          sessionStorage.setItem('PKCE_verifier', verifier.toString());
        }
        url += '&code_challenge=' + challenge;
        url += '&code_challenge_method=S256';
      }
      url += '&nonce=' + encodeURIComponent(nonce);
    }
    if (noPrompt) {
      url += '&prompt=none';
    }

    //   url += '&accessType=offline&approvalPrompt=force';
    return url;
  }

  logOut(key: string) {
    if (!key) {
      return;
    }
    let logoutUrl: string | undefined = sessionStorage.getItem('logoutUrl') || this.logoutUrl;

    sessionStorage.clear();

    this.coreService.getValueFromLocker(key, (content: any) => {
      if (!this.validateUrlForHttps(this.logoutUrl)) {
        this.toasterService.error(
          "logoutUrl  must use HTTPS (with TLS), or config value for property 'requireHttps' must be set to 'false' and allow HTTP (without TLS)."
        );
        return null;
      } else {

        let params = new HttpParams();
        let headers = new HttpHeaders().set(
          'Content-Type',
          'application/x-www-form-urlencoded'
        );

        let flag = true;
        let basicAuth = false;
        if (this.tokenEndMethodsSupported.length > 0) {
          if (this.tokenEndMethodsSupported.length > 1) {
            this.tokenEndMethodsSupported.forEach((method) => {
              if (method == 'none') {
                flag = false;
              } else if (method == 'client_secret_basic' && content.clientSecret) {
                basicAuth = true;
                flag = false;
                headers = headers.set('Authorization', 'Basic ' + window.btoa(decodeURIComponent(encodeURIComponent(content.clientId + ':' + content.clientSecret))));
              }
            })
          }
        }
        if (flag && content.clientSecret) {
          params = params.set('client_secret', content.clientSecret);
        }
        if (!basicAuth) {
          params = params.set('client_id', content.clientId);
        }
        return new Promise((resolve, reject) => {
          let revokeAccessToken: Observable<null>;
          let revokeRefreshToken: Observable<null>;
          if (logoutUrl && content.token && content.token != 'undefined' && content.token != 'null') {
            let revokationParams = params
              .set('token', content.token)
              .set('token_type_hint', 'access_token');
            if (logoutUrl.includes('login.windows.net')) {
              // navigate to the logout URL
              window.location.replace(logoutUrl + '?post_logout_redirect_uri=' + window.location.href);
              return
            }
            revokeAccessToken = this.coreService.log(
              logoutUrl,
              revokationParams,
              headers
            );
          } else {
            revokeAccessToken = of(null);
          }

          if (logoutUrl && content.refreshToken && content.refreshToken != 'undefined' && content.refreshToken != 'null') {
            let revokationParams = params
              .set('token', content.refreshToken)
              .set('token_type_hint', 'refresh_token');
            revokeRefreshToken = this.coreService.log(
              logoutUrl,
              revokationParams,
              {headers}
            );
          } else {
            revokeRefreshToken = of(null);
          }

          combineLatest([revokeAccessToken, revokeRefreshToken]).subscribe({
              next: (res: any) => {
                resolve(res);
              }, error: (err) => {
                reject(err);
              }
            }
          );
        });
      }
    });

  }

  createAndSaveNonce() {
    return this.createNonce().then((nonce: any) => {
      sessionStorage.setItem('nonce', nonce);
      return nonce;
    });
  }

  createNonce() {
    return new Promise((resolve) => {
      const unreserved = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
      let size = 45;
      let id = '';

      if (crypto) {
        let bytes: any = new Uint8Array(size);
        window.crypto.getRandomValues(bytes);

        bytes = bytes.map((x: any) => unreserved.charCodeAt(x % unreserved.length));
        id = String.fromCharCode.apply(null, bytes);
      } else {
        while (0 < size--) {
          id += unreserved[(Math.random() * unreserved.length) | 0];
        }
      }
      resolve(base64UrlEncode(id));
    });
  }

  async createChallangeVerifierPairForPKCE() {
    const verifier = await this.createNonce();
    const challenge = generateCodeChallengeFromVerifier(
      verifier
    );
    return [challenge, verifier];
  }

  async tryLoginCodeFlow(options?: any) {
    options = options || {};
    const querySource = options.customHashFragment
      ? options.customHashFragment.substring(1)
      : window.location.search;
    const parts = this.getCodePartsFromUrl(querySource);
    const code = parts['code'];
    sessionStorage.setItem('code', code);
    const state = parts['state'];
    const sessionState = parts['session_state'];
    const idToken = parts['id_token'];
    const accessToken = parts['access_token'];
    if (!options.preventClearHashAfterLogin) {
      const href = location.origin +
        location.pathname +
        location.search
          .replace(/code=[^&\$]*/, '')
          .replace(/scope=[^&\$]*/, '')
          .replace(/state=[^&\$]*/, '')
          .replace(/session_state=[^&\$]*/, '')
          .replace(/^\?&/, '?')
          .replace(/&$/, '')
          .replace(/^\?$/, '')
          .replace(/&+/g, '&')
          .replace(/\?&/, '?')
          .replace(/\?$/, '') +
        location.hash;
      history.replaceState(null, window.name, href);
    }
    let [nonceInState, userState] = this.parseState(state);
    this.state = userState;
    if (parts['error']) {

      this.toasterService.error('error trying to login');
      // this.handleLoginError(options, parts);
      //  const err = new OAuthErrorEvent('code_error', {}, parts);
      //  this.eventsSubject.next(err);
      return Promise.reject({code_error: parts});
    } else if(idToken){
      this.access_token = accessToken;
      this.id_token = idToken;
      return Promise.resolve();
    }
    if (!options.disableNonceCheck) {
      if (!nonceInState) {
        return Promise.resolve();
      }
      if (!options.disableOAuth2StateCheck) {
        const success = this.validateNonce(nonceInState);
        if (!success) {
          this.toasterService.error('invalid_nonce_in_state');
          return Promise.reject({code_error: parts});
        }
      }
      sessionStorage.setItem('session_state', sessionState);
      if (code) {
        await this.getTokenFromCode(code, options);

        this.restoreRequestedRoute();
        return Promise.resolve();
      } else {
        return Promise.resolve();
      }
    }
    return Promise.reject();
  }

  restoreRequestedRoute() {
    const requestedRoute = sessionStorage.getItem('requested_route');
    if (requestedRoute) {
      history.replaceState(null, '', window.location.origin + requestedRoute);
    }
  }

  /**
   * Get token using an intermediate code. Works for the Authorization Code flow.
   */
  getTokenFromCode(code: any, options: any) {
    let params = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('redirect_uri', options.customRedirectUri || this.redirectUri);
    let PKCEVerifier = sessionStorage.getItem('PKCE_verifier');

    if (!PKCEVerifier) {
      this.toasterService.warning('No PKCE verifier found in oauth storage!');
    } else {
      params = params.set('code_verifier', PKCEVerifier);
    }
    return this.fetchAndProcessToken(params);
  }

  fetchAndProcessToken(params: any): any {
    this.assertUrlNotNullAndCorrectProtocol(this.tokenEndpoint, 'tokenEndpoint');
    let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    const clientId = sessionStorage.getItem('clientId');
    const clientSecret = sessionStorage.getItem('clientSecret');
    let flag = true;
    let basicAuth = false;
    if (this.tokenEndMethodsSupported.length > 0) {
      if (this.tokenEndMethodsSupported.length > 1) {
        this.tokenEndMethodsSupported.forEach((method) => {
          if (method == 'none') {
            flag = false;
          } else if (method == 'client_secret_basic' && (this.clientSecret || clientSecret)) {
            basicAuth = true;
            flag = false;
            headers = headers.set('Authorization', 'Basic ' + window.btoa(decodeURIComponent(encodeURIComponent((this.clientId || clientId) + ':' + (this.clientSecret || clientSecret)))));
          }
        })
      }
    }
    if (flag && (this.clientSecret || clientSecret)) {
      params = params.set('client_secret', this.clientSecret || clientSecret);
    }
    if (!basicAuth) {
      params = params.set('client_id', this.clientId || clientId);
    }
    if (this.tokenEndpoint) {
      return new Promise((resolve, reject) => {
        this.coreService
          .log(this.tokenEndpoint, params, {headers})
          .subscribe({
            next: (tokenResponse) => {
              this.access_token = tokenResponse.access_token;
              this.id_token = tokenResponse.id_token;
              this.refresh_token = tokenResponse.refresh_token;

              sessionStorage['$SOS$TOKENEXPIRETIME'] = (new Date().getTime() + (tokenResponse.expires_in * 1000)) - 20000;
              this.renewToken();
              resolve(tokenResponse);
            }, error: (err) => {
              this.toasterService.error('Error getting token', err);
              reject(err);
            }
          });
      });
    }
  }

  getCodePartsFromUrl(queryString: any) {
    if (!queryString || queryString.length === 0) {
      return this.getHashFragmentParams();
    }
    // normalize query string
    if (queryString.charAt(0) === '?') {
      queryString = queryString.substring(1);
    }
    return this.parseQueryString(queryString);
  }

  private getHashFragmentParams() {
    let hash = window.location.hash;
    hash = decodeURIComponent(hash);
    if (hash.indexOf('#') !== 0) {
      return {};
    }
    const questionMarkPosition = hash.indexOf('?');
    if (questionMarkPosition > -1) {
      hash = hash.substring(questionMarkPosition + 1);
    } else {
      hash = hash.substring(1);
    }
    return this.parseQueryString(hash);
  }

  private parseQueryString(queryString: any) {
    const data: any = {};
    let pairs, pair, separatorIndex, escapedKey, escapedValue, key, value;
    if (queryString === null) {
      return data;
    }
    pairs = queryString.split('&');
    for (let i = 0; i < pairs.length; i++) {
      pair = pairs[i];
      separatorIndex = pair.indexOf('=');
      if (separatorIndex === -1) {
        escapedKey = pair;
        escapedValue = null;
      } else {
        escapedKey = pair.substring(0, separatorIndex);
        escapedValue = pair.substring(separatorIndex + 1);
      }
      key = decodeURIComponent(escapedKey);
      value = decodeURIComponent(escapedValue);
      if (key.substring(0, 1) === '/') {
        key = key.substring(1);
      }
      data[key] = value;
    }
    return data;
  }

  parseState(state: any) {
    let nonce = state;
    let userState = '';
    if (state) {
      const idx = state.indexOf(this.nonceStateSeparator);
      if (idx > -1) {
        nonce = state.substring(0, idx);
        userState = state.substring(idx + this.nonceStateSeparator.length);
      }
    }
    return [nonce, userState];
  }

  validateNonce(nonceInState: any) {
    let savedNonce = sessionStorage.getItem('nonce');
    if (savedNonce !== nonceInState) {
      const err = 'Validating access_token failed, wrong state/nonce.';
      console.error(err, savedNonce, nonceInState);
      return false;
    }
    return true;
  }

  initLoginFlow() {
    if (!this.validateUrlForHttps(this.loginUrl)) {
      throw new Error("loginUrl  must use HTTPS (with TLS), or config value for property 'requireHttps' must be set to 'false' and allow HTTP (without TLS).");
    }

    this.createLoginUrl('', false)
      .then((uri) => {
        location.href = uri;
      }).catch((error) => {
      this.toasterService.error('Error in initAuthorizationCodeFlow');
      console.error(error);
    });
  }

  private renewToken(): void {
    let miliseconds = (new Date().getTime() < parseInt(sessionStorage['$SOS$TOKENEXPIRETIME'])) ? (parseInt(sessionStorage["$SOS$TOKENEXPIRETIME"]) - new Date().getTime()) : (new Date().getTime() - parseInt(sessionStorage['$SOS$TOKENEXPIRETIME']));
    setTimeout(() => {
      const key = sessionStorage['$SOS$KEY'];
      if (key) {
        this.coreService.getValueFromLocker(key, (content: any) => {
          this.refreshToken(content).then((res) => {
            this.coreService.saveValueInLocker({
              content: {
                token: res.access_token,
                refreshToken: res.refresh_token,
                clientId: content.clientId,
                clientSecret: content.clientSecret
              }
            }, () => {
              this.renewToken();
            });
          }).catch(() => {
            this._logout();
          })

        });
      }
    }, miliseconds);

  }

  /**
   * Refreshes the token using a refresh_token.
   * This does not work for implicit flow, b/c
   * there is no refresh_token in this flow.
   * A solution for this is provided by the
   * method silentRefresh.
   */
  public refreshToken(data: any): Promise<any> {
    this.assertUrlNotNullAndCorrectProtocol(
      this.tokenEndpoint,
      'tokenEndpoint'
    );
    return new Promise((resolve, reject) => {
      let params = new HttpParams()
        .set('grant_type', 'refresh_token')
        .set('scope', this.scope)
        .set('refresh_token', data.refreshToken);

      let headers = new HttpHeaders().set(
        'Content-Type',
        'application/x-www-form-urlencoded'
      );
      let flag = true;
      let basicAuth = false;
      if (this.tokenEndMethodsSupported.length > 0) {
        if (this.tokenEndMethodsSupported.length > 1) {
          this.tokenEndMethodsSupported.forEach((method) => {
            if (method == 'none') {
              flag = false;
            } else if (method == 'client_secret_basic' && data.clientSecret) {
              basicAuth = true;
              flag = false;
              headers = headers.set('Authorization', 'Basic ' + window.btoa(decodeURIComponent(encodeURIComponent((data.clientId + ':' + this.clientSecret)))));
            }
          })
        }
      }
      if (flag && data.clientSecret) {
        params = params.set('client_secret', data.clientSecret);
      }
      if (!basicAuth) {
        params = params.set('client_id', data.clientId);
      }
      this.coreService
        .log(this.tokenEndpoint, params, {headers})
        .subscribe({
          next:
            (tokenResponse) => {
              sessionStorage['$SOS$TOKENEXPIRETIME'] = (new Date().getTime() + (tokenResponse.expires_in * 1000)) - 30000;
              resolve(tokenResponse);
            },
          error: (err) => {
            this._logout();
            reject(err);
          }
        });
    });
  }

}
