import {Component, EventEmitter, Input, Optional, Output} from '@angular/core';
import {ControlContainer, NgForm} from "@angular/forms";

@Component({
  selector: 'app-select-input',
  templateUrl: './select-input.component.html',
  viewProviders: [{
    provide: ControlContainer,
    deps: [[Optional, NgForm]],
    useFactory: (ngForm: NgForm) => ngForm,
  }]
})
export class SelectInputComponent {
  @Input() placeholder = '';
  @Input() isMultiple = false;
  @Input() name = '';
  @Input() isAllowClear = false;
  @Input() isSearchable = false;
  @Input() isRequired = false;
  @Input() isSelectDisabled: any
  @Input() dropdownClassName = '';
  @Input() ngClassName = '';
  @Input() classNames = '';
  @Input() listArray: any[];
  @Input() object: any = {};
  @Input() attributeName = '';
  @Input() optionLabel = '';
  @Input() optionValue = '';
  @Input() extraLabelText = '';
  @Input() id = '';

  @Output() modelChange = new EventEmitter<any>();
  @Output() onBlur = new EventEmitter<any>();

  constructor() {
  }

}
