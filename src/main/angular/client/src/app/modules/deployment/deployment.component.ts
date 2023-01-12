import {Component, OnInit} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {isEmpty} from 'underscore';

@Component({
  selector: 'app-deployment',
  templateUrl: './deployment.component.html'
})
export class DeploymentComponent implements OnInit {
  data: any = {
    descriptor: {},
    joc: [],
    agents: [],
    controllers: []
  };

  obj: any = {
    isDescriptorExpanded: true,
    isMoreDescriptorDetail: false,
    isJOCExpanded: false,
    isAgentExpanded: false,
    isControllerExpanded: false,
    isLicenseExpanded: false,
    isCertificateExpanded: false
  };

  mainObj: any = {};

  isValid = false;
  errorMessages: Array<string> = [];

  constructor(private coreService: CoreService) {

  }

  ngOnInit(): void {
    this.addJOC();
  }

  addLicense(): void {
    this.data.license = {};
    this.obj.isLicenseExpanded = true;
  }

  addAgent(): void {
    this.data.agents.push({
      target: {
        connection: {},
        authentication: {},
        makeService: false
      },
      media: {},
      installation: {},
      configuration: {
        controller: {},
        certificates: {},
        templates: [{name: ''}]
      }
    });
  }

  removeAgent(): void {
    this.data.agents = [];
  }

  addController(): void {
    this.data.controllers.push({
      target: {
        connection: {},
        authentication: {},
        makeService: false
      },
      media: {},
      installation: {},
      configuration: {
        certificates: {},
        templates: [{name: ''}]
      }
    });
  }

  removeController(): void {
    this.data.controllers = [];
  }

  addJOC(): void {
    this.data.joc.push({
      target: {
        connection: {},
        authentication: {},
        makeService: false
      },
      media: {},
      installation: {
        isUser: true,
        isPreserveEnv: true
      },
      configuration: {
        certificates: {},
        templates: [{name: ''}],
        startFiles: {}
      }
    });
  }

  removeJOC(): void {
    this.data.joc = [];
  }

  addCertificates(): void {
    this.data.certificates = {
      controller: {},
      joc: {}
    };
    this.obj.isCertificateExpanded = true;
  }

  addSecondaryJOC(): void {
    this.addJOC();
  }

  removeSecondaryJOC(): void {
    this.data.joc.splice(1, 1);
  }

  removeSecondaryController(): void {
    this.data.controllers.splice(1, 1);
  }

  addSecondaryController(): void {
    this.addController()
  }

  addAnotherAgent(): void {
    this.addAgent();
  }

  addTemplates(list): void {
    list.push({name: ''});
  }

  removeTemplates(list, index): void {
    list.splice(index, 1);
  }

  convertJSON(): void {
    this.isValid = true;
    this.errorMessages = [];
    this.mainObj = {
      descriptor: this.data.descriptor
    };
    if (this.data.license && !isEmpty(this.data.license)) {
      this.mainObj['license'] = this.data.license;
      if (!this.data.license.licenseKeyFile || !this.data.license.licenseBinFile) {
        this.isValid = false;
        this.errorMessages.push(this.data.license.licenseKeyFile ? 'License bin file is required' : 'License key file is required');
      }
    }
    if (this.data.certificates && !isEmpty(this.data.certificates)) {
      if (isEmpty(this.data.certificates.controller) && isEmpty(this.data.certificates.joc)) {

      } else {
        this.mainObj['certificates'] = this.data.certificates;
        if (isEmpty(this.data.certificates.controller)) {
          if (!this.data.certificates.joc.primaryJocCert || !this.data.certificates.joc.secondaryJocCert) {
            this.isValid = false;
            this.errorMessages.push(this.data.joc.primaryJocCert ? 'Primary JOC certificate is required' : 'Secondary JOC certificate is required');
          }
        } else {
          if (!this.data.certificates.controller.primaryControllerCert || !this.data.certificates.controller.secondaryControllerCert) {
            this.isValid = false;
            this.errorMessages.push(this.data.controller.primaryControllerCert ? 'Primary Controller certificate is required' : 'Secondary Controller certificate is required');
          }
        }
      }
    }
    if (this.data.joc && this.data.joc.length > 0) {

      if (!this.data.jocId) {
        this.isValid = false;
        this.errorMessages.push('Joc Id is required');
      } else {
        this.mainObj['joc'] = {};
        this.data.joc.forEach((element, index) => {
          if (!this.mainObj.joc[this.data.jocId]) {
            this.mainObj.joc[this.data.jocId] = {};
          }
          if (index == 0) {
            this.mainObj.joc[this.data.jocId].primary = {};
            this.checkAndUpdateObj(this.mainObj.joc[this.data.jocId].primary, 'joc', element);
          } else {
            this.mainObj.joc[this.data.jocId].secondary = {};
            this.checkAndUpdateObj(this.mainObj.joc[this.data.jocId].secondary, 'joc', element);
          }
        });
      }
    }
    if (this.data.agents && !isEmpty(this.data.agents)) {
      if (!this.data.agentId) {
        this.isValid = false;
        this.errorMessages.push('Agent Id is required');
      } else {
        this.mainObj['agents'] = {};
        this.data.controllers.forEach((element, index) => {
          if (!this.mainObj.controllers[this.data.controllersId]) {
            this.mainObj.controllers[this.data.controllersId] = {};
          }
          if (index == 0) {
            this.mainObj.controllers[this.data.controllersId].primary = {};
            this.checkAndUpdateObj(this.mainObj.controllers[this.data.controllersId].primary, 'controllers', element);
          } else {
            this.mainObj.controllers[this.data.controllersId].secondary = {};
            this.checkAndUpdateObj(this.mainObj.controllers[this.data.controllersId].secondary, 'controllers', element);
          }
        });
      }
    }
    if (this.data.controllers && this.data.controllers.length > 0) {
      if (!this.data.controllerId) {
        this.isValid = false;
        this.errorMessages.push('Controller Id is required');
      } else {
        this.mainObj['controllers'] = {};
        this.data.controllers.forEach((element, index) => {
          if (!this.mainObj.controllers[this.data.controllersId]) {
            this.mainObj.controllers[this.data.controllersId] = {};
          }
          if (index == 0) {
            this.mainObj.controllers[this.data.controllersId].primary = {};
            this.checkAndUpdateObj(this.mainObj.controllers[this.data.controllersId].primary, 'controllers', element);
          } else {
            this.mainObj.controllers[this.data.controllersId].secondary = {};
            this.checkAndUpdateObj(this.mainObj.controllers[this.data.controllersId].secondary, 'controllers', element);
          }
        });
      }
    }
  }

  private checkAndUpdateObj(obj, type, source): void {
    if (!isEmpty(source.target.connection) || !isEmpty(source.target.authentication)
      || source.target.packageLocation || source.target.execPre || source.target.execPost || source.target.makeService) {
      obj.target = {
        packageLocation: source.target.packageLocation,
        execPre: source.target.execPre,
        execPost: source.target.execPost,
        makeService: source.target.makeService
      };
    }
    if (source.target.connection && !isEmpty(source.target.connection)) {
      if (!obj.target.connection) {
        obj.target.connection = {};
      }
      if (!source.target.connection.host) {
        this.isValid = false;
        this.errorMessages.push('Connection host is required');
      }
      obj.target.connection = source.target.connection;
    }
    if (source.target.authentication && !isEmpty(source.target.authentication)) {
      if (!obj.target.authentication) {
        obj.target.authentication = {};
      }
      if (!source.target.authentication.method || !source.target.authentication.user) {
        this.isValid = false;
        this.errorMessages.push(!source.target.authentication.method ? 'Authentication method is required' : 'Authentication user is required');
      }
      obj.target.authentication = source.target.authentication;
    }

    if (source.media && !isEmpty(source.media)) {
      if (!source.media.release || !source.media.tarball) {
        this.isValid = false;
        this.errorMessages.push(!source.media.release ? 'Media release is required' : 'Media tarball is required');
      }
      obj.media = source.media;
    } else {
      this.isValid = false;
      this.errorMessages.push('Media is required');
    }

    if (source.installation && !isEmpty(source.installation)) {
      if ((type == 'joc' && !source.installation.setupDir) || !source.installation.home || !source.installation.data) {
        this.isValid = false;
        this.errorMessages.push((type == 'joc' && !source.installation.setupDir) ? 'Installation setupDir is required' : !source.installation.home ? 'Installation home is required' : 'Installation data is required');
      }
      if(!source.installation.httpPort && !source.installation.httpsPort){
        this.isValid = false;
        this.errorMessages.push('Installation http or https port is required');
      }
      obj.installation = source.installation;
    } else {
      this.isValid = false;
      this.errorMessages.push('Installation is required');
    }

    if (source.configuration && !isEmpty((source.configuration))) {
      if (source.configuration.responseDir || !isEmpty(source.configuration.certificates) || !isEmpty(source.configuration.startFiles) || source.configuration.templates.length > 0) {
        obj.configuration = {};
        if (source.configuration.responseDir) {
          obj.configuration.responseDir = source.configuration.responseDir;
        }
        if (source.configuration.templates.length > 0) {
          source.configuration.templates.forEach((temp) => {
            if (temp.name) {
              if (!obj.configuration.templates) {
                obj.configuration.templates = [];
              }
              obj.configuration.templates.push(temp.name)
            }
          });
        }

        if (source.configuration.startFiles && !isEmpty(source.configuration.startFiles)) {
          obj.configuration.startFiles = source.configuration.startFiles;
        }

        if (!isEmpty(source.configuration.certificates)) {
          obj.configuration.certificates = source.configuration.certificates;
          if (!source.configuration.certificates.keyStore || !source.configuration.certificates.keyStorePassword || !source.configuration.certificates.keyPassword
            || !source.configuration.certificates.trustStore || !source.configuration.certificates.trustStorePassword) {
            this.isValid = false;
            this.errorMessages.push(!source.configuration.certificates.keyStore ? 'Key store certificate is required' : !source.configuration.certificates.keyStorePassword ? 'Key store password certificate is required' :
              !source.configuration.certificates.keyPassword ? 'Key password certificate is required' : !source.configuration.certificates.trustStore ? 'Trust store certificate is required' : 'Trust store password certificate is required');
          }
        }
      }
    }
  }

}
