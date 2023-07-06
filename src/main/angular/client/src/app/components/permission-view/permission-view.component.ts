import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-permission-view',
  templateUrl: './permission-view.component.html'
})
export class PermissionViewComponent {
  @Input() permission: any = {};
  @Input() schedulerIds: any = {};
  selectedController: string;
  controllerPermission: any = {};

  constructor() {
  }

  ngOnInit(): void {
    this.setControllerPermission();
  }

  changeController(controller): void {
    this.selectedController = controller;
    this.setControllerPermission();
  }

  private setControllerPermission(): void {
    const data = this.permission.controllers[this.selectedController];
    if (data) {
      this.controllerPermission = data;
    } else {
      this.controllerPermission = this.permission.controllerDefaults;
    }
  }


}
