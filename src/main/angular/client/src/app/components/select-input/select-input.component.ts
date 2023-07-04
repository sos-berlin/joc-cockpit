import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-select-input',
  templateUrl: './select-input.component.html'
})
export class SelectInputComponent {
  @Input() placeholder = '';
  @Input() isMultiple = false;
  @Input() name = '';
  @Input() isAllowClear = false;
  @Input() isSearchable = false;
  @Input() isRequired = false;
  @Input() dropdownClassName = '';
  @Input() ngClassName = '';
  @Input() classNames = '';
  @Input() listArray: any[];
  @Input() object: any = {};
  @Input() attributeName = '';
  @Input() optionLabel = '';
  @Input() optionValue = '';
  @Input() isCustomContent = false;
  @Input() extraLabelText = '';

  @Output() modelChange = new EventEmitter<any>();
  @Output() onBlur = new EventEmitter<any>();

  constructor() {
  }

}
