import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { isEmpty } from 'underscore';

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
        templates: []
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
        templates: []
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
        this.errorMessages.push(this.data.license.licenseKeyFile ? 'licenseBinFileRequired' : 'licenseKeyFileRequired');
      }
    }
    if (this.data.certificates && !isEmpty(this.data.certificates)) {
      if (isEmpty(this.data.certificates.controller) && isEmpty(this.data.certificates.joc)) {

      } else {
        this.mainObj['certificates'] = this.data.certificates;
        if (isEmpty(this.data.certificates.controller)) {
          if (!this.data.certificates.joc.primaryJocCert || !this.data.certificates.joc.secondaryJocCert) {
            this.isValid = false;
            this.errorMessages.push(this.data.joc.primaryJocCert ? 'primaryJocCertRequired' : 'secondaryJocCertRequired');
          }
        } else {
          if (!this.data.certificates.controller.primaryControllerCert || !this.data.certificates.controller.secondaryControllerCert) {
            this.isValid = false;
            this.errorMessages.push(this.data.controller.primaryControllerCert ? 'primaryControllerCertRequired' : 'secondaryControllerCertRequired');
          }
        }
      }
    }
    if (this.data.joc && this.data.joc.length > 0) {

      if (!this.data.jocId) {
        this.isValid = false;
        this.errorMessages.push('jocIdRequired');
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
      this.mainObj['agents'] = this.data.agents;
    }
    if (this.data.controllers && this.data.controllers.length > 0) {
      this.mainObj['controllers'] = this.data.controllers;
    }
  }

  private checkAndUpdateObj(obj, type, source): void {
    console.log(obj);
    console.log(type);
    console.log(source);

    if (source.target.connection && !isEmpty(source.target.connection)) {
      if(!obj.target){
        obj.target = {connection:{}};
      } else if (!obj.target.connection) {
        obj.target.connection = {};
      }
      if(!source.target.connection.host){
        this.isValid = false;
      } else {
        obj.target.connection = source.target.connection;
      }
    }
    if (source.target.authentication && !isEmpty(source.target.authentication)) {

    }

    if (!isEmpty(source.target.connection) || !isEmpty(source.target.authentication)
      || source.target.packageLocation || source.target.execPre || source.target.execPost || source.target.makeService) {
        obj.target = source.target;
    }
  }

}
