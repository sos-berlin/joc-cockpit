import { Injectable } from "@angular/core";
import { HttpHeaders, HttpParams } from "@angular/common/http";
import crypto from 'crypto-js';
import sha256 from 'crypto-js/sha256';
import { ToastrService } from "ngx-toastr";
import { CoreService } from "../../services/core.service";
import { combineLatest, Observable, of } from "rxjs";

// GENERATING CODE CHALLENGE FROM VERIFIER
function sha256(plain) {
    // returns promise ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest("SHA-256", data);
}

async function generateCodeChallengeFromVerifier(v) {
    let hashed = await sha256(v);
    let base64encoded = base64urlencode(hashed);
    return base64encoded;
}

function base64urlencode(a) {
    let str = "";
    let bytes = new Uint8Array(a);
    const len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        str += String.fromCharCode(bytes[i]);
    }
    return btoa(str)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

function base64UrlEncode(str) {
    const base64 = btoa(str);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

class WebHttpUrlEncodingCodec {
    encodeKey(k) {
        return encodeURIComponent(k);
    }
    encodeValue(v) {
        return encodeURIComponent(v);
    }
    decodeKey(k) {
        return decodeURIComponent(k);
    }
    decodeValue(v) {
        return decodeURIComponent(v);
    }
}

@Injectable({
    providedIn: 'root'
})
export class OIDCAuthService {
    clientId?: string;
    redirectUri?: string;
    loginUrl?: string;
    scope?: string;
    requestAccessToken?: boolean;
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
    grantTypesSupported = [];
    discoveryDocumentLoaded = false;
    access_token: string;
    id_token: string;
    refresh_token: string;

    /**
     * Timeout for silent refresh.
     */
    silentRefreshTimeout?: number = 1000 * 20;
    expiresInTimeout?: number;

    constructor(private coreService: CoreService, private toasterService: ToastrService) {
        if (sessionStorage.$SOS$KEY) {
            console.log(sessionStorage.$SOS$KEY);
            this.coreService.renewLocker(sessionStorage.$SOS$KEY);
        }
    }

    configure(config) {
        this.issuer = config.iamOidcAuthenticationUrl,
            this.redirectUri = window.location.origin + '/joc';
        this.scope = 'openid profile email';
        this.responseType = 'code';
        this.showDebugInformation = true;
    }

    loadDiscoveryDocument(fullUrl = null) {
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
            }
            this.coreService.get(fullUrl).subscribe({
                next: (doc) => {
                    if (!this.validateDiscoveryDocument(doc)) {
                        this.toasterService.error('discovery_document_validation_error');
                        return;
                    }
                    this.loginUrl = doc.authorization_endpoint;
                    this.logoutUrl = doc.revocation_endpoint || doc.end_session_endpoint || '';
                    sessionStorage.logoutUrl = this.logoutUrl;
                    this.grantTypesSupported = doc.grant_types_supported;
                    this.issuer = doc.issuer;
                    this.tokenEndpoint = doc.token_endpoint;
                    this.discoveryDocumentLoaded = true;
                    const result = {
                        discoveryDocument: doc,

                    };
                    resolve(result);

                }, error: (err) => {
                    reject(err);
                }
            });
        });
    }

    private validateDiscoveryDocument(doc) {
        let errors;
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

    validateUrlFromDiscoveryDocument(url) {
        const errors = [];
        const httpsCheck = this.validateUrlForHttps(url);
        if (!httpsCheck) {
            errors.push('https for all urls required. Also for urls received by discovery.');
        }
        return errors;
    }

    validateUrlForHttps(url) {
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

    assertUrlNotNullAndCorrectProtocol(url, description) {
        if (!url) {
            throw new Error(`'${description}' should not be null`);
        }
        if (!this.validateUrlForHttps(url)) {
            throw new Error(`'${description}' must use HTTPS (with TLS), or config value for property 'requireHttps' must be set to 'false' and allow HTTP (without TLS).`);
        }
    }

    async createLoginUrl(state = '', noPrompt = false) {
        let redirectUri = this.redirectUri;
        const nonce = await this.createAndSaveNonce();
        if (state) {
            state = nonce + this.nonceStateSeparator + encodeURIComponent(state);
        } else {
            state = nonce;
        }

        this.responseType = 'code';

        const seperationChar = this.loginUrl.indexOf('?') > -1 ? '&' : '?';
        let scope = this.scope;
        if (!scope.match(/(^|\s)openid($|\s)/)) {
            scope = 'openid ' + scope;
        }
        let url = this.loginUrl +
            seperationChar +
            'response_type=' +
            encodeURIComponent(this.responseType) +
            '&client_id=' +
            encodeURIComponent(this.clientId) +
            '&state=' +
            encodeURIComponent(state) +
            '&redirect_uri=' +
            encodeURIComponent(redirectUri) +
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

        if (noPrompt) {
            url += '&prompt=none';
        }

        //   url += '&accessType=offline&approvalPrompt=force';
        return url;
    }

    logOut(key) {
        if (!key) {
            return;
        }
        let logoutUrl = sessionStorage.getItem('logoutUrl') || this.logoutUrl;

        sessionStorage.clear();

        this.coreService.getValueFromLocker(key, (content) => {
            if (!this.validateUrlForHttps(this.logoutUrl)) {
                this.toasterService.error(
                    "logoutUrl  must use HTTPS (with TLS), or config value for property 'requireHttps' must be set to 'false' and allow HTTP (without TLS)."
                );
                return;
            }

            let params = new HttpParams({ encoder: new WebHttpUrlEncodingCodec() });
            let headers = new HttpHeaders().set(
                'Content-Type',
                'application/x-www-form-urlencoded'
            );

            params = params.set('client_id', content.clientId);
            params = params.set('client_secret', content.clientSecret);
            return new Promise((resolve, reject) => {
                let revokeAccessToken: Observable<void>;
                let revokeRefreshToken: Observable<void>;
                if (content.token && content.token != 'undefined' && content.token != 'null') {
                    let revokationParams = params
                        .set('token', content.token)
                        .set('token_type_hint', 'access_token');
                    revokeAccessToken = this.coreService.log(
                        logoutUrl,
                        revokationParams,
                        { headers }
                    );
                } else {
                    revokeAccessToken = of(null);
                }

                if (content.refreshToken && content.refreshToken != 'undefined' && content.refreshToken != 'null') {
                    let revokationParams = params
                        .set('token', content.refreshToken)
                        .set('token_type_hint', 'refresh_token');
                    revokeRefreshToken = this.coreService.log(
                        logoutUrl,
                        revokationParams,
                        { headers }
                    );
                } else {
                    revokeRefreshToken = of(null);
                }

                combineLatest([revokeAccessToken, revokeRefreshToken]).subscribe(
                    (res) => {
                        resolve(res);
                    },
                    (err) => {
                        reject(err);
                    }
                );
            });
        });

    }

    createAndSaveNonce() {
        return this.createNonce().then(function (nonce: string) {
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
                let bytes = new Uint8Array(size);
                window.crypto.getRandomValues(bytes);

                bytes = bytes.map((x) => unreserved.charCodeAt(x % unreserved.length));
                id = String.fromCharCode.apply(null, bytes);
            }
            else {
                while (0 < size--) {
                    id += unreserved[(Math.random() * unreserved.length) | 0];
                }
            }
            resolve(base64UrlEncode(id));
        });
    }

    async createChallangeVerifierPairForPKCE() {
        const verifier = await this.createNonce();
        const challenge = await generateCodeChallengeFromVerifier(
            verifier
        );
        return [challenge, verifier];
    }

    async tryLoginCodeFlow(options = null) {
        options = options || {};
        const querySource = options.customHashFragment
            ? options.customHashFragment.substring(1)
            : window.location.search;
        const parts = this.getCodePartsFromUrl(querySource);
        const code = parts['code'];
        sessionStorage.setItem('code', code);
        const state = parts['state'];
        const sessionState = parts['session_state'];
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
            return Promise.reject({ code_error: parts });
        }
        if (!options.disableNonceCheck) {
            if (!nonceInState) {
                return Promise.resolve();
            }
            if (!options.disableOAuth2StateCheck) {
                const success = this.validateNonce(nonceInState);
                if (!success) {
                    this.toasterService.error('invalid_nonce_in_state');
                    return Promise.reject({ code_error: parts });
                }
            }
            sessionStorage.setItem('session_state', sessionState);
            if (code) {
                await this.getTokenFromCode(code, options);

                this.restoreRequestedRoute();
                return Promise.resolve();
            }
            else {
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
    getTokenFromCode(code, options) {
        let params = new HttpParams({ encoder: new WebHttpUrlEncodingCodec() })
            .set('grant_type', 'authorization_code')
            .set('code', code)
            .set('redirect_uri', options.customRedirectUri || this.redirectUri);
        let PKCEVerifier = sessionStorage.getItem('PKCE_verifier');

        if (!PKCEVerifier) {
            this.toasterService.warning('No PKCE verifier found in oauth storage!');
        } else {
            params = params.set('code_verifier', PKCEVerifier);
        }
        return this.fetchAndProcessToken(params, options);
    }

    fetchAndProcessToken(params, options) {
        options = options || {};
        this.assertUrlNotNullAndCorrectProtocol(this.tokenEndpoint, 'tokenEndpoint');
        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        const clientId = sessionStorage.getItem('clientId');
        const clientSecret = sessionStorage.getItem('clientSecret');
        params = params.set('client_id', this.clientId || clientId);
        params = params.set('client_secret', this.clientSecret || clientSecret);
        return new Promise((resolve, reject) => {
            this.coreService
                .log(this.tokenEndpoint, params, { headers })
                .subscribe({
                    next: (tokenResponse) => {
                        this.access_token = tokenResponse.access_token;
                        this.id_token = tokenResponse.id_token;
                        this.refresh_token = tokenResponse.refresh_token;
                        this.expiresInTimeout = tokenResponse.expires_in;
                        resolve(tokenResponse);
                    }, error: (err) => {
                        this.toasterService.error('Error getting token', err);
                        reject(err);
                    }
                });
        });
    }

    getCodePartsFromUrl(queryString) {
        if (!queryString || queryString.length === 0) {
            return this.getHashFragmentParams();
        }
        // normalize query string
        if (queryString.charAt(0) === '?') {
            queryString = queryString.substr(1);
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
            hash = hash.substr(questionMarkPosition + 1);
        }
        else {
            hash = hash.substr(1);
        }
        return this.parseQueryString(hash);
    }

    private parseQueryString(queryString) {
        const data = {};
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
            }
            else {
                escapedKey = pair.substr(0, separatorIndex);
                escapedValue = pair.substr(separatorIndex + 1);
            }
            key = decodeURIComponent(escapedKey);
            value = decodeURIComponent(escapedValue);
            if (key.substr(0, 1) === '/') {
                key = key.substr(1);
            }
            data[key] = value;
        }
        return data;
    }

    parseState(state) {
        let nonce = state;
        let userState = '';
        if (state) {
            const idx = state.indexOf(this.nonceStateSeparator);
            if (idx > -1) {
                nonce = state.substr(0, idx);
                userState = state.substr(idx + this.nonceStateSeparator.length);
            }
        }
        return [nonce, userState];
    }

    validateNonce(nonceInState) {
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


    /**
   * Refreshes the token using a refresh_token.
   * This does not work for implicit flow, b/c
   * there is no refresh_token in this flow.
   * A solution for this is provided by the
   * method silentRefresh.
   */
    public refreshToken(refreshToken): Promise<any> {
        this.assertUrlNotNullAndCorrectProtocol(
            this.tokenEndpoint,
            'tokenEndpoint'
        );
        return new Promise((resolve, reject) => {
            let params = new HttpParams({ encoder: new WebHttpUrlEncodingCodec() })
                .set('grant_type', 'refresh_token')
                .set('scope', this.scope)
                .set('refresh_token', refreshToken)
                .set('client_id', this.clientId)
                .set('client_secret', this.clientSecret);

            let headers = new HttpHeaders().set(
                'Content-Type',
                'application/x-www-form-urlencoded'
            );

            this.coreService
                .log(this.tokenEndpoint, params, { headers })
                .subscribe({
                    next:
                        (tokenResponse) => {
                            console.debug('refresh tokenResponse', tokenResponse);
                            console.log(
                                tokenResponse.access_token,
                                tokenResponse.refresh_token,
                                tokenResponse.expires_in
                            );
                            this.expiresInTimeout = tokenResponse.expires_in;
                            resolve(tokenResponse);
                        },
                    error: (err) => {
                        console.error('Error refreshing token', err);
                        reject(err);
                    }
                });
        });
    }

}
