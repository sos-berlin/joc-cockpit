import {Injectable} from '@angular/core';
import jwkToPem from "jwk-to-pem";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  props = ['accessTokenId', 'currentUserData', 'forcePasswordChange', 'currentUserIdentityService', 'sessionTimeout', 'permission', 'scheduleIds'];
  propsPrefix = '$SOS$';
  rememberMe = false;
  scheduleIds: any;
  accessTokenId: string;
  currentUserData: string;
  forcePasswordChange: any;
  currentUserIdentityService: string;
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
    sessionStorage.$SOS$URL = null;
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
        url.match('/configuration') ? 'Configuration' : url.match('/users') ? 'ManageAccount' : '';
    let showViews: any = {};
    if (window.sessionStorage.showViews) {
      showViews = JSON.parse(window.sessionStorage.showViews);
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

  createPublicKeyCredentialRequest(challenge, fido2Properties, user): PublicKeyCredentialCreationOptions {
    return {
      challenge: challenge,
      rp: {
        id: window.location.hostname,
        name: 'JS7'
      },
      user: {
        id: new Uint8Array(32),
        name: user.userName || user.accountName,
        displayName: user.email || user.accountName
      },
      pubKeyCredParams: [
        {type: "public-key", alg: -7},
        {type: "public-key", alg: -257}
      ],
      timeout: fido2Properties?.iamFido2Timeout ? fido2Properties?.iamFido2Timeout * 1000 : 60000,
      authenticatorSelection: {
        residentKey: fido2Properties?.iamFido2ResidentKey?.toLowerCase() || 'preferred',
        requireResidentKey: fido2Properties?.iamFido2ResidentKey?.toLowerCase() == 'required',
        userVerification: fido2Properties?.iamFido2UserVerification?.toLowerCase() || 'preferred'
      },
      extensions: {"credProps": true},
      attestation: 'direct'
    };
  }

  // Get public key from attestation object
  getPublicKey(attestationObject: any): any {
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


    let jwk = {};
    let publicKeyJwk = COSEtoJWK(publicKeyObject);
    function convertEcToPEM(curve, x, y) {
      // Create a JWK (JSON Web Key) object from the public key components
      jwk = {
        crv: curve,
        kty: 'EC',
        x: base64urlEncode(x),
        y: base64urlEncode(y)
      };

      // Convert the JWK to PEM format
      return jwkToPem(jwk);
    }

    function convertRsaToPEM(x, y) {
      // Create a JWK (JSON Web Key) object from the public key components
      jwk = {
        kty: 'RSA',
        n: base64urlEncode(x),
        e: base64urlEncode(y)
      };

      // Convert the JWK to PEM format
      return jwkToPem(jwk);
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
        return convertEcToPEM('P-256', parsedCoseKey[-2], parsedCoseKey[-3]);
        // ECDSA algorithm
      } else if (algorithm === -257) {
        // RSASSA-PKCS1-v1_5 algorithm
        return convertRsaToPEM(parsedCoseKey[-1], parsedCoseKey[-2]);
      }
    }

    

    return {publicKey: publicKeyJwk, jwk: this.bufferToBase64Url(jwk) || btoa(JSON.stringify(jwk))}; // The extracted public key in JWK format
  }
}
