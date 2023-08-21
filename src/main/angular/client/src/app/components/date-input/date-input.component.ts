import {Component, EventEmitter, Input, Optional, Output} from '@angular/core';
import {differenceInCalendarDays} from "date-fns";
import {ControlContainer, NgForm} from "@angular/forms";
import {CoreService} from "../../services/core.service";

@Component({
  selector: 'app-date-input',
  templateUrl: './date-input.component.html',
  viewProviders: [
    {
      provide: ControlContainer,
      deps: [[Optional, NgForm]],
      useFactory: (ngForm: NgForm) => ngForm,
    }
  ]
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
  @Input() ignoreThirdParam = false;

  @Output() modelChange = new EventEmitter<any>();

  constructor(private coreService: CoreService) {
  }

  selectTime(time, isEditor = false, val = 'from'): void {
    if(this.ignoreThirdParam) {
      this.coreService.selectTime(time, isEditor, this.object);
    } else {
      this.coreService.selectTime(time, isEditor, this.object, val);
    }
  }

  disabledDate = (current: Date): boolean => {
    // Can not select days before today and today
    if(!this.isPreviousDateDisabled){
      return false;
    }
    return differenceInCalendarDays(current, new Date()) < 0;
  }

}
