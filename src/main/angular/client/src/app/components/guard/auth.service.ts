import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  props = ['accessTokenId', 'currentUserData', 'forcePasswordChange', 'currentUserIdentityService', 'sessionTimeout', 'permission', 'scheduleIds'];
  propsPrefix = '$SOS$';
  rememberMe = false;
  scheduleIds: any;
  accessTokenId = '';
  currentUserData = '';
  forcePasswordChange: any;
  currentUserIdentityService = '';
  sessionTimeout: any;
  permission: any;

  constructor() {
    const self: any = this;
    for (const prop of this.props) {
      self[prop] = this.load(prop);
    }
  }

  save(): void {
    const self: any = this;
    for (const prop of this.props) {
      this._save(sessionStorage, prop, self[prop]);
    }
  }

  setUser(userData: any): void {
    this.accessTokenId = userData.accessToken;
    this.currentUserData = userData.account;
    this.forcePasswordChange = userData.forcePasswordChange;
    this.currentUserIdentityService = userData.identityService;
    this.sessionTimeout = userData.sessionTimeout;
  }

  setPermission(permission: any): void {
    this.permission = JSON.stringify(permission);
  }

  setIds(scheduleIds: any): void {
    this.scheduleIds = JSON.stringify(scheduleIds);
  }

  clearUser(): void {
    this.accessTokenId = null;
    this.currentUserData = null;
    this.sessionTimeout = null;
    this.permission = null;
    this.scheduleIds = null;
    sessionStorage['$SOS$URL'] = null;
  }

  clearStorage(): void {
    for (const prop of this.props) {
      this._save(sessionStorage, prop, null);
      this._save(localStorage, prop, null);
    }
  }

  permissionCheck(url: any): boolean {
    const routePath = url === '/dashboard' ? 'Dashboard' : url === '/daily_plan' ? 'DailyPlan' : url.match(/workflow/) ? 'WorkFlow' : url === '/file_transfer' ? 'FileTransfer' :
      url === '/audit_log' ? 'AuditLog' : url.match('order') ? 'Order' : url.match('/resources') ? 'Resource' : url === '/history' ? 'History' :
        url.match('/configuration') ? 'Configuration' : url.match('/users') ? 'ManageAccount': url.match('/encipherment') ? 'Encipherment' : '';
    let showViews: any = {};
    if (window.sessionStorage['showViews']) {
      showViews = JSON.parse(window.sessionStorage['showViews']);
    }
    const permission = JSON.parse(this.permission);
    if (!permission) {
      return false;
    }
    let ifPermissionPassed = false;
    switch (routePath) {
      case 'Dashboard':
        if (showViews.dashboard !== undefined) {
          if (showViews.dashboard === true) {
            ifPermissionPassed = true;
          }
        } else {
          ifPermissionPassed = true;
        }
        break;
      case 'DailyPlan':
        if (showViews.dailyPlan !== undefined) {
          if (showViews.dailyPlan) {
            ifPermissionPassed = true;
          }
        } else {
          if (permission.joc && permission.joc.dailyPlan.view && permission.currentController.orders.view) {
            ifPermissionPassed = true;
          }
        }
        break;
      case 'WorkFlow':
        if (showViews.workflows !== undefined) {
          if (showViews.workflows) {
            ifPermissionPassed = true;
          }
        } else {
          if (permission.currentController && permission.currentController.workflows.view) {
            ifPermissionPassed = true;
          }
        }
        break;
      case 'Order':
        if (permission.currentController && permission.currentController.orders.view) {
          ifPermissionPassed = true;
        }
        break;
      case 'History':
        if (showViews.history !== undefined) {
          if (showViews.history === true) {
            ifPermissionPassed = true;
          }
        } else {
          if (permission.joc && (permission.joc || permission.joc.fileTransfer.view
            || permission.currentController.deployments.view || permission.joc.dailyPlan.view)) {
            ifPermissionPassed = true;
          }
        }
        break;
      case 'Resource':
        if (showViews.resources !== undefined) {
          if (showViews.resources === true) {
            ifPermissionPassed = true;
          }
        } else {
          if (permission.currentController && (permission.currentController.agents.view || permission.currentController.locks.view
            || permission.joc.calendars.view || permission.joc.documentations.view)) {
            ifPermissionPassed = true;
          }
        }
        break;
      case 'AuditLog':
        if (showViews.auditLog !== undefined) {
          if (showViews.auditLog === true) {
            ifPermissionPassed = true;
          }
        } else {
          if (permission.joc && permission.joc.auditLog.view) {
            ifPermissionPassed = true;
          }
        }
        break;
      case 'FileTransfer':
        if (showViews.fileTransfers !== undefined) {
          if (showViews.fileTransfers === true) {
            ifPermissionPassed = true;
          }
        } else {
          if (permission.joc && permission.joc.fileTransfer.view) {
            ifPermissionPassed = true;
          }
        }
        break;
      case 'Configuration':
        if (showViews.configuration !== undefined) {
          if (showViews.configuration === true) {
            ifPermissionPassed = true;
          }
        } else {

          if (permission.joc && (permission.joc.inventory.view && (url == '/configuration' || url.match('/configuration/inventory'))) || (permission.joc.fileTransfer.view && (url == '/configuration' || url == '/configuration/file_transfer'))
            || (permission.joc.notification.view && (url == '/configuration' || url == '/configuration/notification')) || (permission.joc.others.view && (url == '/configuration' || url == '/configuration/other'))) {
            ifPermissionPassed = true;
          }
        }
        break;
      case 'ManageAccount':
        if (permission.joc && permission.joc.administration.accounts.view) {
          ifPermissionPassed = true;
        }
        break;
      case 'Encipherment':
        if (permission.joc && permission.joc.encipherment.encrypt) {
          ifPermissionPassed = true;
        }
        break;
      default:
        ifPermissionPassed = true;
    }
    return ifPermissionPassed;
  }

  private _save(storage: any, name: any, value: any): void {
    const key: any = this.propsPrefix + name;
    if (value == null) {
      value = '';
    }
    storage[key] = value;
  }

  private load(name: any): any {
    const key = this.propsPrefix + name;
    return localStorage[key] || sessionStorage[key] || null;
  }

  bufferToBase64Url(buffer: any) {
    const base64String = btoa(String.fromCharCode(...new Uint8Array(buffer)))
    base64String.replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return base64String;
  }

  createPublicKeyCredentialRequest(challenge, fidoProperties, user): PublicKeyCredentialCreationOptions {
    let authenticatorSelection: AuthenticatorSelectionCriteria = {
      userVerification: fidoProperties?.iamFidoUserVerification?.toLowerCase() || 'preferred',
      residentKey: 'required',
      requireResidentKey: true
    };
    if (fidoProperties?.iamFidoProtocolType == 'FIDO2') {
      authenticatorSelection.authenticatorAttachment = 'cross-platform';
    } else if (fidoProperties?.iamFidoProtocolType == 'PASSKEY') {
      authenticatorSelection.authenticatorAttachment = 'platform';
    }
    return {
      challenge: challenge,
      rp: {
        name: 'JS7'
      },
      user: {
        id: Uint8Array.from(
          (user.userName || user.accountName) + '', c => c.charCodeAt(0)),
        name: user.userName || user.accountName,
        displayName: user.userName || user.accountName
      },
      pubKeyCredParams: [
        {type: "public-key", alg: -7},
        {type: "public-key", alg: -257}
      ],
      timeout: fidoProperties?.iamFidoTimeout ? fidoProperties?.iamFidoTimeout * 1000 : 60000,
      authenticatorSelection,
      extensions: {"credProps": true}
    };
  }

  // Convert JWK to PEM format using native Web Crypto API 
  private async jwkToPemNative(jwk: any): Promise<string> {
    try {
      // Determine the algorithm based on key type
      const algorithm = jwk.kty === 'EC'
        ? { name: 'ECDSA', namedCurve: jwk.crv }
        : { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };

      // Import the JWK as a CryptoKey using browser's native crypto
      const key = await crypto.subtle.importKey(
        'jwk',
        jwk,
        algorithm,
        true,
        ['verify']
      );

      // Export as SPKI (SubjectPublicKeyInfo) format
      const exported = await crypto.subtle.exportKey('spki', key);

      // Convert to PEM format
      const exportedAsString = String.fromCharCode(...new Uint8Array(exported));
      const exportedAsBase64 = btoa(exportedAsString);
      const pemExported = `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;

      return pemExported;
    } catch (error) {
      throw error;
    }
  }

  // Get public key from attestation object
  async getPublicKey(attestationObject: any): Promise<any> {
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

    let jwk: any = {};

    // Function to base64url encode data
    const base64urlEncode = (data: any): string => {
      const base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(data)));
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    };

    // Convert EC JWK to PEM format using native Web Crypto API
    const convertEcToPEM = async (curve: string, x: any, y: any): Promise<string> => {
      jwk = {
        crv: curve,
        kty: 'EC',
        x: base64urlEncode(x),
        y: base64urlEncode(y)
      };
      const pem = await this.jwkToPemNative(jwk);
      return pem;
    };

    // Convert RSA JWK to PEM format using native Web Crypto API
    const convertRsaToPEM = async (n: any, e: any): Promise<string> => {
      jwk = {
        kty: 'RSA',
        n: base64urlEncode(n),
        e: base64urlEncode(e)
      };
      const pem = await this.jwkToPemNative(jwk);
      return pem;
    };

    // Function to convert COSE format to JWK format
    const COSEtoJWK = async (parsedCoseKey: any): Promise<string> => {
      const COSE_ALGORITHM_LABEL = 3;

      // Extract the values from the COSE public key
      const algorithm = parsedCoseKey[COSE_ALGORITHM_LABEL];

      // Set the specific key parameters based on the algorithm and public key values
      if (algorithm === -7) {
        // ECDSA algorithm (P-256)
        return await convertEcToPEM('P-256', parsedCoseKey[-2], parsedCoseKey[-3]);
      } else if (algorithm === -257) {
        // RSASSA-PKCS1-v1_5 algorithm
        return await convertRsaToPEM(parsedCoseKey[-1], parsedCoseKey[-2]);
      } else {
        return jwk;
      }
    };

    const publicKeyJwk = await COSEtoJWK(publicKeyObject);

    return {publicKey: publicKeyJwk, jwk: this.bufferToBase64Url(jwk) || btoa(JSON.stringify(jwk))}; // The extracted public key in JWK format
  }
}
