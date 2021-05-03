import {Component, Input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import * as _ from 'underscore';
import {NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';
import {ValueEditorComponent} from '../../../../components/value-editor/value.component';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-job-resource',
  templateUrl: './job-resource.component.html'
})
export class JobResourceComponent implements OnChanges, OnDestroy {
  @Input() preferences: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() permission: any;
  @Input() copyObj: any;
  @Input() reload: any;
  @Input() isTrash: any;

  jobResource: any = {};
  invalidMsg: string;
  objectType = 'JOBRESOURCE';

  constructor(private coreService: CoreService, private dataService: DataService, private modal: NzModalService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.copyObj && !changes.data){
      return;
    }
    if (changes.reload) {
      if (this.reload) {
        this.getObject();
        this.reload = false;
        return;
      }
    }
    if (this.jobResource.actual) {
      this.saveJSON();
    }
    if (changes.data) {
      if (this.data.type) {
        this.getObject();
      } else {
        this.jobResource = {};
      }
    }
  }

  ngOnDestroy(): void {
    if (this.data.type) {
      this.saveJSON();
    }
  }

  rename(inValid): void {
    if (this.data.id === this.jobResource.id && this.data.name !== this.jobResource.name) {
      if (!inValid) {
        const data = this.coreService.clone(this.data);
        const name = this.jobResource.name;
        this.coreService.post('inventory/rename', {
          id: data.id,
          newPath: name
        }).subscribe(() => {
          if (data.id === this.data.id) {
            this.data.name = name;
          }
          data.name = name;
          this.dataService.reloadTree.next({rename: data});
        }, () => {
          this.jobResource.name = this.data.name;
        });
      } else {
        this.jobResource.name = this.data.name;
      }
    }
  }

  deploy(): void {
    this.dataService.reloadTree.next({deploy: this.jobResource});
  }

  backToListView(): void {
    this.dataService.reloadTree.next({back: this.jobResource});
  }

  addEnv(): void {
    const param = {
      name: '',
      value: ''
    };
    if (this.jobResource.configuration.env) {
      if (!this.coreService.isLastEntryEmpty(this.jobResource.configuration.env, 'name', '')) {
        this.jobResource.configuration.env.push(param);
      }
    }
    this.saveJSON();
  }

  removeEnv(index): void {
    this.jobResource.configuration.env.splice(index, 1);
    this.saveJSON();
  }

  onKeyPress($event): void {
    if ($event.which === '13' || $event.which === 13) {
      this.addEnv();
    }
  }

  upperCase(env): void {
    if (env.name) {
      env.name = env.name.toUpperCase();
      if (!env.value) {
        env.value = '$' + env.name.toLowerCase();
        this.saveJSON();
      }
    }
  }

  drop(event: CdkDragDrop<string[]>, list): void {
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.saveJSON();
  }

  openEditor(data): void {
    const modal = this.modal.create({
      nzTitle: null,
      nzContent: ValueEditorComponent,
      nzComponentParams: {
        data: data.value
      },
      nzFooter: null,
      nzClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        data.value = result;
      }
    });
  }

  saveJSON(): void {
    if (this.isTrash) {
      return;
    }
    if (!_.isEqual(this.jobResource.actual, JSON.stringify(this.jobResource.configuration))) {
      let obj = this.coreService.clone(this.jobResource.configuration);
      if (obj.env && _.isArray(obj.env)) {
        this.coreService.convertArrayToObject(obj, 'env', true);
      }
      this.coreService.post('inventory/store', {
        configuration: obj,
        valid: obj.env && obj.env.length > 0,
        id: this.jobResource.id,
        objectType: this.objectType
      }).subscribe((res: any) => {
        if (res.id === this.data.id && this.jobResource.id === this.data.id) {
          this.jobResource.actual = JSON.stringify(this.jobResource.configuration);
          this.jobResource.valid = res.valid;
          this.jobResource.deployed = false;
          this.data.valid = res.valid;
          this.data.deployed = false;
          this.setErrorMessage(res);
        }
      }, (err) => {
        console.log(err);
      });
    }
  }

  private setErrorMessage(res): void {
    if (res.invalidMsg) {
      if (res.invalidMsg.match('env: is missing')) {
        this.invalidMsg = 'inventory.message.envIsMissing';
      }
      if (!this.invalidMsg) {
        this.invalidMsg = res.invalidMsg;
      }
    } else {
      this.invalidMsg = '';
    }
  }

  private getObject(): void {
    const URL = this.isTrash ? 'inventory/trash/read/configuration' : 'inventory/read/configuration';
    this.coreService.post(URL, {
      id: this.data.id,
    }).subscribe((res: any) => {
      if (res.configuration) {
        delete res.configuration['TYPE'];
        delete res.configuration['path'];
        delete res.configuration['versionId'];
      } else {
        res.configuration = {};
      }
      this.jobResource = res;
      this.jobResource.path1 = this.data.path;
      this.jobResource.name = this.data.name;
      if (this.jobResource.configuration.env) {
        this.jobResource.configuration.env = this.coreService.convertObjectToArray(this.jobResource.configuration, 'env');
      } else {
        this.jobResource.configuration.env = [];
        this.invalidMsg = 'inventory.message.envIsMissing';
        this.addEnv();
      }
      this.jobResource.actual = JSON.stringify(res.configuration);
    });
  }
}
