import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CoreService} from "../../services/core.service";

@Component({
  selector: 'app-date-input',
  templateUrl: './date-input.component.html'
})
export class DateInputComponent {
  @Input() placeholder = '';
  @Input() name = '';
  @Input() isTime = false;
  @Input() isAllowClear = false;
  @Input() isDisable = false;
  @Input() isRequired = false;
  @Input() dateFormat = false;
  @Input() object: any = {};
  @Input() attributeDate = '';
  @Input() attributeTime = '';

  @Output() modelChange = new EventEmitter<any>();

  constructor(private coreService: CoreService) {
  }

  selectTime(time, isEditor = false, val = 'from'): void {
    this.coreService.selectTime(time, isEditor, this.object, val);
  }

}
