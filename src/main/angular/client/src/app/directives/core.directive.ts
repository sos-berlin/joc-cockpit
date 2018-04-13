import { Directive, HostListener} from '@angular/core';
import { NgModel } from '@angular/forms';
@Directive({
    selector: '[timevalidator][ngModel]',
    host: {
        '(ngModelChange)': 'onInputChange($event)'
    }
})

export class TimeValidator {

    constructor(private model:NgModel) {
    }

    onInputChange(event) {
        if (event.length === 2 && /^([0-2][0-9])?$/i.test(event)) {
            if (event >= 24) {
                this.model.valueAccessor.writeValue('24:00:00');
            } else {
                this.model.valueAccessor.writeValue(event + ':');
            }
        } else if (event.length === 5 && /^([0-2][0-9]):([0-5][0-9])?$/i.test(event)) {
            this.model.valueAccessor.writeValue(event + ':');
        } else {
            if (event.length > 1 && event.length < 3 && !(/^([0-2][0-9])?$/i.test(event))) {
                this.model.valueAccessor.writeValue('');
            } else if (event.length === 5 && !(/^([0-2][0-9]):([0-5][0-9])?$/i.test(event))) {
                this.model.valueAccessor.writeValue(event.substring(0, 3));
            } else if (event.length === 8 && !(/^([0-2][0-9]):([0-5][0-9]):([0-5][0-9])?$/i.test(event))) {
                this.model.valueAccessor.writeValue(event.substring(0, 6)+'00');
            }
        }
    }

    @HostListener('focusout', ['$event.target'])
    onFocusout(target) {
        if (target.value) {
            if (target.value.substring(0, 2) == 24) {
                this.model.valueAccessor.writeValue('24:00');
            } else {
                if (target.value.length == 1) {
                    this.model.valueAccessor.writeValue('');

                } else if (target.value.length == 3) {
                    this.model.valueAccessor.writeValue(target.value + '00');

                } else if (target.value.length == 4) {
                    this.model.valueAccessor.writeValue(target.value + '0');

                } else if (target.value.length == 6) {
                    this.model.valueAccessor.writeValue(target.value + '00');

                } else if (target.value.length == 7) {
                    this.model.valueAccessor.writeValue(target.value + '0');

                }
            }
        }

    }
}
