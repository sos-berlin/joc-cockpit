import {Component, EventEmitter, Input, Optional, Output} from '@angular/core';
import {differenceInCalendarDays} from "date-fns";
import {ControlContainer, NgForm, NgModel} from "@angular/forms";
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
  @Input() isTimeRequired: any;
  @Input() isAutoFocus = false;
  @Input() isPreviousDateDisabled = false;
  @Input() isNextDateDisabled: any
  @Input() dateFormat = '';
  @Input() object: any = {};
  @Input() attributeDate = '';
  @Input() attributeTime = '';
  @Input() ignoreThirdParam = false;

  @Output() modelChange = new EventEmitter<any>();

  constructor(private coreService: CoreService) {
  }

  ngOnInit(): void {
    if (this.isTimeRequired == undefined) {
      this.isTimeRequired = this.isRequired;
    }
  }

  onBlur(repeat: NgModel, propertyName: string) {
    this.object[propertyName] = this.coreService.padTime(this.object[propertyName]);
    repeat.control.setErrors({incorrect: false});
    repeat.control.updateValueAndValidity();
  }



  selectTime(time, isEditor = false, val = 'from'): void {
    if (this.ignoreThirdParam) {
      this.coreService.selectTime(time, isEditor, this.object);
    } else {
      this.coreService.selectTime(time, isEditor, this.object, val);
    }
  }

  onTimeChanged(newTime: string, attribute: string) {
    this.object[attribute] = newTime;
    this.selectTime(newTime, true, attribute);
  }

  disabledDate = (current: Date): boolean => {
    if (this.isPreviousDateDisabled && differenceInCalendarDays(current, new Date()) < 0) {
      return true;
    }
    const isoDateString = this.isNextDateDisabled;
    const nextDate = new Date(isoDateString);
    return this.isNextDateDisabled && differenceInCalendarDays(current, nextDate) > 0;
  }

}
