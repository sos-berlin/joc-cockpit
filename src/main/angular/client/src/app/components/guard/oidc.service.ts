import {Injectable} from "@angular/core";
import {HttpHeaders, HttpParams} from "@angular/common/http";
import {combineLatest, Observable, of} from "rxjs";
import * as CryptoJS from 'crypto-js';
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
  requireHttps?: boolean | 'remoteOnly';
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
            const filteredConfig = {
              claims_supported: doc.claims_supported,
              jwks_uri: doc.jwks_uri
            };
            const encodedConfig = this.base64EncodeConfig(filteredConfig);
            sessionStorage.setItem('X-Openid-Configuration', encodedConfig);
            this.loginUrl = doc.authorization_endpoint;
            this.logoutUrl = doc.revocation_endpoint || doc.end_session_endpoint || '';
            this.issuer = doc.issuer;
            sessionStorage['logoutUrl'] = this.logoutUrl;
            this.grantTypesSupported = doc.grant_types_supported;
            this.tokenEndpoint = doc.token_endpoint;
            this.responseTypesSupported = doc.response_types_supported || ['code'];
            this.tokenEndMethodsSupported = doc.token_endpoint_auth_methods_supported || ['client_secret_post'];
            this.discoveryDocumentLoaded = true;
            resolve({discoveryDocument: doc});
          },
          error: (err) => {
            reject(err);
          }
        });
      }
    });
  }

  private base64EncodeConfig(config: any): string {
    const jsonString = JSON.stringify(config);
    return btoa(jsonString);
  }

  private validateDiscoveryDocument(doc: any): boolean {
    let errors: any;
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

  validateUrlFromDiscoveryDocument(url: string): string[] {
    const errors = [];
    const httpsCheck = this.validateUrlForHttps(url);
    if (!httpsCheck) {
      errors.push('https for all urls required. Also for urls received by discovery.');
    }
    return errors;
  }

  validateUrlForHttps(url: string | undefined): boolean {
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

  async createLoginUrl(state = '', noPrompt = false): Promise<string> {
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

      // this.responseTypesSupported.forEach((type: string) => {
      //   if (type.includes('id_token')) {
      //     this.responseType = type;
      //   }
      // })

      url = this.loginUrl +
        seperationChar +
        'response_type=' +
        encodeURIComponent(this.responseType) + (this.clientId ? '&client_id=' + encodeURIComponent(this.clientId) : '') +
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
    } else if (idToken) {
      this.access_token = accessToken;
      this.id_token = idToken;
     // return Promise.resolve();
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
        const obj = this.getTokenFromCode(code, options);
        this.restoreRequestedRoute();
        return Promise.resolve(obj);
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
    let object = {
      'grant_type': 'authorization_code',
      'code': code,
      'redirect_uri': options.customRedirectUri || this.redirectUri
    }
    let params = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('redirect_uri', options.customRedirectUri || this.redirectUri);
    let PKCEVerifier = sessionStorage.getItem('PKCE_verifier');

    if (!PKCEVerifier) {
      this.toasterService.warning('No PKCE verifier found in oauth storage!');
    } else {
      object['code_verifier'] = PKCEVerifier;
    }

    return object;
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

}
