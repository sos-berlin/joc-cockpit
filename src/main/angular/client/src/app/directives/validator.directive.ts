import {Directive, Attribute, forwardRef} from '@angular/core';
import {Validator, AbstractControl, NG_VALIDATORS} from '@angular/forms';

@Directive({
  selector: '[validateEqual][formControlName],[validateEqual][formControl],[validateEqual][ngModel]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => ValidatorOneDirective), multi: true}
  ]

})

export class ValidatorOneDirective implements Validator {

  constructor(@Attribute('validateEqual') public validateEqual: string) {
  }

  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v != null)
      if ((!v || /^\s*$/i.test(v)
          || /^\s*[-](\d+)(h|d|w|M|y)\s*$/.test(v)
          || /^\s*(now\s*\-)\s*(\d+)\s*$/i.test(v)
          || /^\s*(now)\s*$/i.test(v)
          || /^\s*(Today)\s*$/i.test(v)
          || /^\s*(Yesterday)\s*$/i.test(v)
          || /^\s*[-](\d+)(h|d|w|M|y)\s*to\s*[-](\d+)(h|d|w|M|y)\s*$/.test(v)
          || /^\s*[-](\d+)(h|d|w|M|y)\s*to\s*[-](\d+)(h|d|w|M|y)\s*[-](\d+)(h|d|w|M|y)\s*$/.test(v)
          || /^\s*[-](\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*[-](\d+)(h|d|w|M|y)\s*$/.test(v)
          || /^\s*[-](\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*[-](\d+)(h|d|w|M|y)\s*[-,+]\s*(\d+)(h|d|w|M|y)\s*$/.test(v)
          || /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(v)
        )) {
        return {
          validateEqual: true
        }
      }

    return null;
  }
}
