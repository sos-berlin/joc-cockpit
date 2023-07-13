import {Component, EventEmitter, Input, Output} from '@angular/core';
import {differenceInCalendarDays} from "date-fns";
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
  @Input() isAutoFocus = false;
  @Input() isPreviousDateDisabled = false;
  @Input() dateFormat = '';
  @Input() object: any = {};
  @Input() attributeDate = '';
  @Input() attributeTime = '';

  @Output() modelChange = new EventEmitter<any>();

  constructor(private coreService: CoreService) {
  }

  selectTime(time, isEditor = false, val = 'from'): void {
    this.coreService.selectTime(time, isEditor, this.object, val);
  }

  disabledDate = (current: Date): boolean => {
    // Can not select days before today and today
    if(!this.isPreviousDateDisabled){
      return false;
    }
    return differenceInCalendarDays(current, new Date()) < 0;
  }

}
