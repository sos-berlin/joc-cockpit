import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  OnChanges,
  Output
} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, NgModel, ValidationErrors, Validator} from '@angular/forms';
import {SaveService} from '../services/save.service';

declare const $: any;

@Directive({
  selector: '[timeDurationValidator]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: TimeDurationValidatorDirective,
      multi: true
    }
  ]
})
export class TimeDurationValidatorDirective implements Validator {
  isEnter = false;
  isBackslash = false;

  @HostListener('keydown', ['$event'])
  onKeyPress(event): void {
    if (event.key === 'Enter' || event.which === 13) {
      this.isEnter = true;
      event.stopPropagation();
      event.preventDefault();
    }
    if (event.key === 'Backspace' || event.which === 8) {
      this.isBackslash = true;
    }
  }

  @HostListener('input', ['$event.target'])
  onInputChange(target): void {
    if (this.isEnter || this.isBackslash) {
      this.isEnter = false;
      this.isBackslash = false;
      return;
    } else {
      if (target.value) {
        // Allow formats like +1h 2m 3s or +1H 2M 3S
        if (/^\+?(\d+h\s?)?(\d+m\s?)?(\d+s\s?)?$/i.test(target.value) ||
          /^\+?(\d+d\s?)?(\d+h\s?)?(\d+m\s?)?(\d+s\s?)?$/i.test(target.value) ||
          /^\+?(\d+w\s?)?(\d+d\s?)?(\d+h\s?)?(\d+m\s?)?(\d+s\s?)?$/i.test(target.value) ||
          /^\+?(\d+M\s?)?(\d+w\s?)?(\d+d\s?)?(\d+h\s?)?(\d+m\s?)?(\d+s\s?)?$/i.test(target.value) ||
          /^\+?(\d+y\s?)?(\d+M\s?)?(\d+w\s?)?(\d+d\s?)?(\d+h\s?)?(\d+m\s?)?(\d+s\s?)?$/i.test(target.value)) {
          target.value = target.value;
        }
        // Handle two digits input and add ':'
        else if (target.value.length === 2 && /^[0-2][0-9]$/i.test(target.value)) {
          target.value = target.value + ':';
        }
        // Handle hh:mm input and add ':'
        else if (target.value.length === 5 && /^[0-2][0-9]:[0-5][0-9]$/i.test(target.value)) {
          target.value = target.value + ':';
        }
        // Handle hh:mm:ss input
        else if (target.value.length === 8 && /^[0-2][0-9]:[0-5][0-9]:[0-5][0-9]$/i.test(target.value)) {
          target.value = target.value;
        }
        // Invalid input handling
        else {
          target.value = target.value;
        }
      }
    }
  }

  @HostListener('focusout', ['$event.target'])
  onFocusout(target): void {
    if (target.value) {
      target.value = this.padTime(target.value);
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value) {
      // Check for +hh:mm:ss or +hh:mm format
      if (/^\+?\d{2}:\d{2}(:\d{2})?$/i.test(value)) {
        const parts = value.replace('+', '').split(':');
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const seconds = parts[2] ? parseInt(parts[2], 10) : 0;
        if (hours >= 0  && minutes >= 0 && minutes < 60 && seconds >= 0 && seconds < 60) {
          return null;
        } else {
          return { validateRegex: true };
        }
      }
      // Check for +1h 2m 3s or +1H 2M 3S format, including days, weeks, months, and years
      if (/^\+?(\d+h\s?)?(\d+m\s?)?(\d+s\s?)?$/i.test(value) ||
        /^\+?(\d+d\s?)?(\d+h\s?)?(\d+m\s?)?(\d+s\s?)?$/i.test(value) ||
        /^\+?(\d+w\s?)?(\d+d\s?)?(\d+h\s?)?(\d+m\s?)?(\d+s\s?)?$/i.test(value) ||
        /^\+?(\d+M\s?)?(\d+w\s?)?(\d+d\s?)?(\d+h\s?)?(\d+m\s?)?(\d+s\s?)?$/i.test(value) ||
        /^\+?(\d+y\s?)?(\d+M\s?)?(\d+w\s?)?(\d+d\s?)?(\d+h\s?)?(\d+m\s?)?(\d+s\s?)?$/i.test(value)) {
        return null;
      }
    }
    return { validateRegex: true };
  }

  private padTime(value: string): string {
    if (!value) {
      return value;
    }

    const parts = value.split(':');
    if (parts.length === 2) {
      parts[0] = parts[0].padStart(2, '0');
      parts[1] = parts[1].padEnd(2, '0');
      return parts.join(':');
    } else if (parts.length === 3) {
      parts[0] = parts[0].padStart(2, '0');
      parts[1] = parts[1].padStart(2, '0');
      parts[2] = parts[2].padEnd(2, '0');
      return parts.join(':');
    }

    // Handle cases where ':' is not included in the value
    const isDigit = (str: string) => /^\d+$/.test(str);

    if (isDigit(value)) {
      if (value.length === 1) {
        return `0${value}:00:00`;
      } else if (value.length === 2) {
        return `${value}:00:00`;
      } else if (value.length === 3) {
        return `${value[0]}${value[1]}:0${value[2]}:00`;
      } else if (value.length === 4) {
        return `${value[0]}${value[1]}:${value[2]}${value[3]}:00`;
      } else if (value.length === 5) {
        return `${value[0]}${value[1]}:${value[2]}${value[3]}:${value[4]}0`;
      } else if (value.length === 6) {
        return `${value[0]}${value[1]}:${value[2]}${value[3]}:${value[4]}${value[5]}0`;
      } else if (value.length === 7) {
        return `${value[0]}${value[1]}:${value[2]}${value[3]}:${value[4]}${value[5]}${value[6]}0`;
      }
    }

    return value;
  }
}

@Directive({
  selector: '[timevalidator]',
  providers: [NgModel]
})
export class TimeValidatorDirective {
  isEnter = false;
  isBackslash = false;

  constructor(private model: NgModel) {
  }

  @HostListener('keydown', ['$event'])
  onKeyPress(event): void {
    if (event.key === 'Enter' || event.which === 13) {
      this.isEnter = true;
      event.stopPropagation();
      event.preventDefault();
    }
    if (event.key === 'Backspace' || event.which === 8) {
      this.isBackslash = true;
    }
  }

  @HostListener('input', ['$event.target'])
  onInputChange(target): void {
    if (this.isEnter || this.isBackslash) {
      this.isEnter = false;
      this.isBackslash = false;
      return;
    } else {
      if (target.value) {
        if (target.value.length === 2 && /^([0-2][0-9])?$/i.test(target.value)) {
          if (target.value >= 24) {
            this.model.valueAccessor.writeValue('24:00:00');
          } else {
            this.model.valueAccessor.writeValue(target.value + ':');
          }
        } else if (target.value.length === 5 && /^([0-2][0-9]):([0-5][0-9])?$/i.test(target.value)) {
          this.model.valueAccessor.writeValue(target.value + ':');
        } else {
          if (target.value.length > 1 && target.value.length < 3 && !(/^([0-2][0-9])?$/i.test(target.value))) {
            this.model.valueAccessor.writeValue('');
          } else if (target.value.length === 5 && !(/^([0-2][0-9]):([0-5][0-9])?$/i.test(target.value))) {
            this.model.valueAccessor.writeValue(target.value.substring(0, 3));
          } else if (target.value.length === 8 && !(/^([0-2][0-9]):([0-5][0-9]):([0-5][0-9])?$/i.test(target.value))) {
            this.model.valueAccessor.writeValue(target.value.substring(0, 6) + '00');
          }
        }
      }
    }
  }

  @HostListener('focusout', ['$event.target'])
  onFocusout(target): void {
    if (target.value) {
      if (target.value.substring(0, 2) === 24) {
        this.model.valueAccessor.writeValue('24:00:00');
      } else {
        if (target.value.length === 3) {
          this.model.valueAccessor.writeValue(target.value + '00');
        } else if (target.value.length === 4) {
          this.model.valueAccessor.writeValue(target.value + '0');
        } else if (target.value.length === 6) {
          this.model.valueAccessor.writeValue(target.value + '00');
        } else if (target.value.length === 7) {
          this.model.valueAccessor.writeValue(target.value + '0');
        }
      }
    }
  }
}

@Directive({
  selector: '[validateReqex]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => RegexValidator), multi: true}
  ]
})
export class RegexValidator implements Validator {
  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v != null) {
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
        return null;
      }
    }
    return {
      validateReqex: true
    };
  }
}

@Directive({
  selector: '[validateDailyPlanReqex]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => DailyPlanRegexValidator), multi: true}
  ]
})
export class DailyPlanRegexValidator implements Validator {
  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v != null) {
      if (/^\s*$/i.test(v)
        || /^\s*(\d+)(d)\s*$/.test(v)
        || /^\s*[-,+](\d+)(d)\s*$/.test(v)
        || /^\s*(now)\s*$/i.test(v)
        || /^\s*(Today)\s*$/i.test(v)) {
        return null;
      }
    }
    return {
      validateDailyPlanReqex: true
    };
  }
}

@Directive({
  selector: '[validateUrl]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => UrlValidator), multi: true}
  ]
})
export class UrlValidator implements Validator {
  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v) {
      if (/^(http|https):\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(?:\/[\w\-\.\/\?\@\%\!\&=\+\~\:\#\;\,]*)?$/gm.test(v) ||
        /^(http|https):\/\/(?:\d{1,3}\.){3}\d{1,3}(?::\d{1,5})?(?:\/[\w\-\.\/\?\@\%\!\&=\+\~\:\#\;\,]*)?$/gm.test(v)) {
        return null;
      }
    } else {
      return null;
    }
    return {
      invalidUrl: true
    };
  }
}

@Directive({
  selector: '[validTimeReqex]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => TimeRegexValidator), multi: true}
  ]
})
export class TimeRegexValidator implements Validator {
  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v) {
      if (/^\s*$/i.test(v) ||
        /^(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)\s*$/.test(v)
        || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]\s*$/i.test(v)
        || v === '24:00'
        || v === '24:00:00'
        || /^\s*\d+\s*$/i.test(v)
      ) {
        return null;
      }
    } else {
      return null;
    }
    return {
      validTimeReqex: true
    };
  }
}

@Directive({
  selector: '[nValidTimeRegex]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => NegativeTimeRegexValidator), multi: true}
  ]
})
export class NegativeTimeRegexValidator implements Validator {
  regex = /^[+-]?(?:(\d+)h\s*,?\s*)?(?:(\d+)m\s*,?\s*)?(?:(\d+)s)?$/;
  isEnter = false;
  isBackslash = false;

  @HostListener('keydown', ['$event'])
  onKeyPress(event): void {
    if (event.key === 'Enter' || event.which === 13) {
      this.isEnter = true;
      event.stopPropagation();
      event.preventDefault();
    }
    if (event.key === 'Backspace' || event.which === 8) {
      this.isBackslash = true;
    }
  }

  @HostListener('input', ['$event.target'])
  onInputChange(target): void {
    if (this.isEnter || this.isBackslash) {
      this.isEnter = false;
      this.isBackslash = false;
      return;
    } else {
      if (target.value) {
        if (target.value.length === 2 && /^([0-2][0-9])?$/i.test(target.value)) {
          if (parseInt(target.value) <= 24) {
            target.value += ':';
          }
        } else if (target.value.length === 5 && /^([0-2][0-9]):([0-5][0-9])?$/i.test(target.value)) {
          target.value += ':';
        }
      }
    }
  }

  validate(c: AbstractControl): { [key: string]: any } {
    const v = c.value;
    if (v) {
      if (/^\s*$/i.test(v) ||
        /^[+-]?((?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?|\d+)$/.test(v)
        || v === '24:00' || v === '+24:00' || v === '-24:00' || v === '24:00:00'
        || v === '+24:00:00' || v === '-24:00:00'
      ) {
        return null;
      }
    } else {
      return null;
    }
    return {
      nValidTimeRegex: true
    };
  }
}

@Directive({
  selector: '[relativeDateValidator]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => RelativeDateValidator), multi: true}
  ]
})
export class RelativeDateValidator implements Validator {
  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v != null) {
      if ((!v || /^\s*$/i.test(v) || /^\s*[+]*(\d+)(h|d|w|M|y)\s*$/.test(v)
      )) {
        return null;
      }
    } else {
      return null;
    }
    return {
      validateRelativeDateRegex: true
    };
  }
}

@Directive({
  selector: '[relativeDateValidatorRegex]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => RelativeDateRegexValidator), multi: true}
  ]
})
export class RelativeDateRegexValidator implements Validator {
  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v != null) {
      if ((!v || /^\s*$/i.test(v) || /^\s*[+]*(\d+)(s|m|h|d|w|M|y)\s*$/.test(v)
      )) {
        return null;
      }
    } else {
      return null;
    }
    return {
      validateRelativeDateRegex: true
    };
  }
}

@Directive({
  selector: '[validateNumberArrayReqex]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => NumberArrayRegexValidator), multi: true}
  ]
})

export class NumberArrayRegexValidator implements Validator {
  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v != null && typeof v == 'string' && v !== 'null' && v != 'undefined') {
      // remove extra space if its there
      v = v.replace(/\s*/g, '');
      if (v == '') {
        return null;
      }
      if (/^(\d{1,4})(,\d{1,4})*(\d)?$/g.test(v)) {
        return null;
      }
    } else {
      return null;
    }
    return {
      validateNumberArrayRegex: true
    };
  }
}

@Directive({
  selector: '[validateDurtionWithPercentageReqex]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => DurationWithPercentageRegexValidator), multi: true}
  ]
})
export class DurationWithPercentageRegexValidator implements Validator {
  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v != null) {
      if (v == '') {
        return null;
      }

      if (/^([0-2][0-4]:[0-5][0-9]:[0-5][0-9])?([0-9]+s?)?([0-9]+%?)?\s*$/i.test(v)
      ) {
        return null;
      }
    } else {
      return null;
    }
    return {
      invalidDuration: true
    };
  }
}

@Directive({
  selector: '[validateSessionTimeReqex]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => SessionTimeRegexValidator), multi: true}
  ]
})
export class SessionTimeRegexValidator implements Validator {
  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v != null) {
      if (v == '') {
        return null;
      }
      if (/^[0-9]+\s*$/i.test(v) || /^((\d+)d[ ]?)?((\d+)h[ ]?)?((\d+)m[ ]?)?((\d+)s[ ]?)?\s*$/.test(v)
      ) {
        return null;
      }
    } else {
      return null;
    }
    return {
      invalidDuration: true
    };
  }
}

@Directive({
  selector: '[validateDurtionReqex]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => DurationRegexValidator), multi: true}
  ]
})
export class DurationRegexValidator implements Validator {
  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v != null) {
      if (v == '') {
        return null;
      }

      if (/^([01][0-9]|2[0-3]):?([0-5][0-9]):?([0-5][0-9])\s*$/i.test(v) || /^[0-9]+\s*$/i.test(v) ||
        /^((\d+)y[ ]?)?((\d+)m[ ]?)?((\d+)w[ ]?)?((\d+)d[ ]?)?((\d+)h[ ]?)?((\d+)M[ ]?)?((\d+)s[ ]?)?\s*$/.test(v)
      ) {
        return null;
      }
    } else {
      return null;
    }
    return {
      invalidDuration: true
    };
  }
}


@Directive({
  selector: '[validateRangeRegex]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => TimeRangeRegexValidator), multi: true}
  ]
})
export class TimeRangeRegexValidator implements Validator {
  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v != null) {
      if (v == '') {
        return null;
      }
      if (/^-?[0-9]+(\.\.-?[0-9]+)?(, *-?[0-9]+(\.\.-?[0-9]+)?)*$/i.test(v) || /^\s*(\d+)\s*$/i.test(v)) {
        return null;
      }
    } else {
      return null;
    }
    return {
      invalidRange: true
    };
  }
}


@Directive({
  selector: '[identifierValidation]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => IdentifierValidator), multi: true}
  ]
})
export class IdentifierValidator implements Validator {
  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v != null) {
      if (v == '') {
        return null;
      }

      if (!v.match(/[!?~'"}\[\]{@:;#\/\\^$%\^\&*\)\(+=]/) && /^(?!\.)(?!.*\.$)(?!.*?\.\.)/.test(v) && /^(?!-)(?!.*--)/.test(v)
        && !v.substring(0, 1).match(/[-]/) && !v.substring(v.length - 1).match(/[-]/) && !/\s/.test(v)) {
        if (/^(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|double|do|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while)$/.test(v)) {
          return {
            invalidIdentifier: true
          };
        } else {
          return null;
        }
      } else {
        return {
          invalidIdentifier: true
        };
      }
    } else {
      return null;
    }
  }
}

@Directive({
  selector: '[facetValidation]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => FacetValidator), multi: true}
  ]
})
export class FacetValidator implements Validator {
  @Input('facetValidation') facetValidation = '';

  validate(c: AbstractControl): ValidationErrors | null {
    let v = c.value;
    return this.facetValidation && v ? (new RegExp(this.facetValidation).test(v)) ? null : {
        invalidFacet: true
      }
      : null;
  }
}

@Directive({
  selector: '[envVariableValidation]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => EnvVariableValidator), multi: true}
  ]
})
export class EnvVariableValidator implements Validator {
  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v != null) {
      if (v == '') {
        return null;
      }

      if (/^([A-Z]|[a-z]|_|\$)([A-Z]|[a-z]|[0-9]|\$|_)*$/.test(v) || /^[0-9_$]*$/.test(v)) {
        return null;
      } else {
        return {
          invalidIdentifier: true
        };
      }
    } else {
      return null;
    }
  }
}

@Directive({
  selector: '[labelValidation]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => LabelValidator), multi: true}
  ]
})
export class LabelValidator implements Validator {
  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v != null) {
      if (v == '') {
        return null;
      }
      if (!v.match(/[?~'"}\[\]{@;\/\\^%\^\&*\)\(+=]/) && /^(?!\.)(?!.*\.$)(?!.*?\.\.)/.test(v) && /^(?!-)(?!.*--)/.test(v)
        && !v.substring(0, 1).match(/[-,/|:!#$]/) && !v.substring(v.length - 1).match(/[-,/|:!#$]/) && !/\s/.test(v)) {
        return null;
      } else {
        return {
          invalidIdentifier: true
        };
      }
    } else {
      return null;
    }
  }
}

@Directive({
  selector: '[appResizable]'
})
export class ResizableDirective {
  @Input() height: string;
  @Input() type: string;
  @Input() path: string;
  @Input() sideView: any;
  @Input() workflowTab: any;

  constructor(private el: ElementRef, private saveService: SaveService) {
  }

  ngOnInit(): void {
    let dom: any;
    if (this.el.nativeElement.attributes.class?.value.match('resizable')) {
      dom = $('#' + this.el.nativeElement.attributes.id.value);
      if (dom) {
        if (this.height) {
          dom.css('height', this.height + 'px');
        }
        dom.resizable({
          minHeight: 150,
          handles: 's',
          resize: (e, x) => {
            if (this.type) {
              const rsHt = JSON.parse(this.saveService.resizerHeight) || {};
              if (rsHt[this.type] && typeof rsHt[this.type] === 'object') {
                rsHt[this.type][this.path] = x.size.height;
              } else if (this.path) {
                rsHt[this.type] = {};
              }
              if (this.path) {
                rsHt[this.type][this.path] = x.size.height;
              } else {
                rsHt[this.type] = x.size.height;
              }
              this.saveService.setResizerHeight(rsHt);
              this.saveService.save();
            } else if (this.workflowTab) {
              if (this.el.nativeElement.attributes.id.value === 'workflowGraphId') {
                this.workflowTab.panelSize = x.size.height;
              } else {
                this.workflowTab.panelSize2 = x.size.height;
              }
            }
          }
        });
      }
    } else if (this.el.nativeElement.attributes.class?.value.match('sidebar-property-panel')) {
      dom = $('#property-panel');
      if (dom) {
        dom.resizable({
          minWidth: 22,
          maxWidth: 768,
          handles: 'w',
          resize: (e, x) => {
            const wt = x.size.width;
            const transitionCSS = {transition: 'none'};
            $('#outlineContainer').css({...transitionCSS, right: wt + 10 + 'px'});
            $('.property-panel').css({width: wt + 'px'});
            $('.sidebar-close').css({...transitionCSS, right: wt + 'px'});
            $('.graph-container').css({...transitionCSS, 'margin-right': wt + 'px'});
            $('.toolbar').css({...transitionCSS, 'margin-right': (wt - 12) + 'px'});
            localStorage['propertyPanelWidth'] = wt;
          }
        });
      }
    } else if (this.el.nativeElement.attributes.class?.value.match('sidebar-log-panel')) {
      dom = $('#property-panel');
      if (dom) {
        dom.resizable({
          minWidth: 22,
          maxWidth: 768,
          handles: 'w',
          resize: (e, x) => {
            const wt = x.size.width;
            const transitionCSS = {transition: 'none'};
            $('.property-panel').css({width: wt + 'px'});
            $('#log-body').css({...transitionCSS, 'margin-right': wt + 'px'});
            $('.sidebar-close').css({...transitionCSS, right: wt + 'px'});
            localStorage['logPanelWidth'] = wt;
          }
        });
      }
    } else if (this.el.nativeElement.attributes.id) {
      dom = $('#' + this.el.nativeElement.attributes.id.value);
      if (dom) {
        if (this.el.nativeElement.attributes.class?.value.match('resource')) {
          dom.css('top', '191px');
        }
        if (this.sideView && this.sideView.width) {
          dom.css('width', this.sideView.width + 'px');
          $('#rightPanel').css({'margin-left': this.sideView.width + 'px'});
        }
        dom.resizable({
          handles: 'e',
          minWidth: 22,
          maxWidth: 1024,
          resize: (e, x) => {
            const wt = dom.width();
            $('#rightPanel').css({'margin-left': wt + 'px'});
            if (this.sideView) {
              this.sideView.width = wt;
            }
          }
        });
      }
    }
  }
}

@Directive({
  selector: '[appAutofocus]'
})
export class AutofocusDirective implements AfterViewInit {
  @Input('appAutofocus') appAutoFocus: boolean;

  constructor(private el: ElementRef) {
  }

  ngAfterViewInit(): void {
    if (this.appAutoFocus) {
      setTimeout(() => {
        if (this.el.nativeElement.attributes.class.value.match('input-number')) {
          $('.ant-input-number input').focus();
        } else {
          this.el.nativeElement.focus();
        }
      }, 10);
    }
  }
}

@Directive({
  selector: '[xmlAutofocus]'
})
export class XMLAutofocusDirective implements AfterViewInit, OnChanges {
  @Input() name;

  constructor(private el: ElementRef) {
  }

  ngAfterViewInit(): void {
    this.init();
  }

  ngOnChanges(): void {
    this.init();
  }

  private init(): void {
    setTimeout(() => {
      if (this.name && this.name.node) {
        if (this.name.type === 'attribute' && this.name.node) {
          if (this.name.errorName && this.name.errorName.e === this.name.node.name) {
            this.el.nativeElement.focus();
          } else if (((this.name.errorName && this.name.errorName.e !== this.name.node.ref) || !this.name.errorName) && this.name.pos == 0) {
            this.el.nativeElement.focus();
          }
        } else if (this.name.type === 'value' && this.name.node) {
          if (this.name.errorName && this.name.errorName.e === this.name.node.ref) {
            this.el.nativeElement.focus();
          } else if (this.name.node && !this.name.node.attributes) {
            this.el.nativeElement.focus();
          }
        }
      }
    }, 0);
  }
}

@Directive({
  selector: '[appMaximum]'
})
export class MaximumDirective {
  @Input('codeMirror') cm: any;
  @Input() textarea: any;
  isMax = false;
  height = 0;
  rows = 10;

  constructor(public el: ElementRef) {
  }

  @HostListener('click', ['$event.target'])
  onClick(): void {
    const hostElem = this.el.nativeElement;
    this.isMax = !this.isMax;
    const modalElem = hostElem.closest('.ant-modal');
    if (this.isMax) {
      this.height = $('.CodeMirror').height();
      if (this.textarea) {
        this.rows = this.textarea.nativeElement.rows;
      }
      hostElem.querySelector('i').classList.add('fa-window-minimize');
      modalElem.classList.add('maximum');
    } else {
      hostElem.querySelector('i').classList.remove('fa-window-minimize');
      modalElem.classList.remove('maximum');
    }
    if (this.cm && this.cm.codeMirror) {
      this.checkAndUpdateCM($(modalElem));
    } else if (this.textarea) {
      this.doResize();
    }
  }

  private checkAndUpdateCM(modalElem): void {
    const width = modalElem.width() - 52;
    let height = modalElem.height() - 204;
    if (this.isMax) {
      const dom: any = document.getElementsByClassName('script-editor')[0] ||
        document.getElementsByClassName('script-editor2')[0];
      if (dom && dom.style['transform']) {
        dom.style['transform'] = 'translate3d(0,0,0)'
      }
    } else {
      height = this.height;
    }
    this.cm.codeMirror.setSize((width), (height));
    $('#resizable').css({'width': 'auto', 'height': 'auto'});
  }

  private doResize() {
    let height = Math.ceil(($('body').height() - 212) / 20);
    this.textarea.nativeElement.rows = !this.isMax ? this.rows : height;
  }

}

@Directive({
  selector: '[timevalidatorReqex]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => TimeValidatorReqexDirective), multi: true}
  ]
})
export class TimeValidatorReqexDirective implements Validator {

  regex = /^(?:(\d+)h\s*,?\s*)?(?:(\d+)m\s*,?\s*)?(?:(\d+)s)?$/;
  isEnter = false;
  isBackslash = false;

  @Output() timeChanged = new EventEmitter<string>();


  @HostListener('keydown', ['$event'])
  onKeyPress(event): void {
    if (event.key === 'Enter' || event.which === 13) {
      this.isEnter = true;
      event.stopPropagation();
      event.preventDefault();
    }
    if (event.key === 'Backspace' || event.which === 8) {
      this.isBackslash = true;
    }
  }

  @HostListener('input', ['$event.target'])
  onInputChange(target): void {
    if (this.isEnter || this.isBackslash) {
      this.isEnter = false;
      this.isBackslash = false;
      return;
    } else {
      if (target.value) {
        if (target.value.length === 2 && /^([0-2][0-9])?$/i.test(target.value)) {
          if (target.value <= 24) {
            this.timeChanged.emit(target.value + ':');
          }
        } else if (target.value.length === 5 && /^([0-2][0-9]):([0-5][0-9])?$/i.test(target.value)) {
          this.timeChanged.emit(target.value + ':');
        }
      }
    }
  }

  @HostListener('focusout', ['$event.target'])
  onFocusout(target): void {
    const value = target.value.trim();

    const matches = this.regex.exec(value);
    if(!value){
      this.timeChanged.emit('');
      return;
    }
    if (matches) {
      let hours = parseInt(matches[1] || '0', 10);
      let minutes = parseInt(matches[2] || '0', 10);
      let seconds = parseInt(matches[3] || '0', 10);

      minutes += Math.floor(seconds / 60);
      seconds = seconds % 60;

      hours += Math.floor(minutes / 60);
      minutes = minutes % 60;

      if (hours < 24 || (hours === 24 && minutes === 0 && seconds === 0)) {
        const formattedValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timeChanged.emit(formattedValue);
      } else {
        this.timeChanged.emit('00:00:00');
      }
    } else {
      let formattedValue = value;
      if (value.length === 3) {
        formattedValue = value[0] + value[1] + ':0' + value[2] + ':00';
      } else if (value.length === 4) {
        formattedValue = value[0] + value[1] + ':' + value[2] + value[3] + ':00';
      } else if (value.length === 5) {
        if (!/^([0-2][0-9]):([0-5][0-9])?$/i.test(value)) {
          formattedValue = value.substring(0, 3);
        } else {
          formattedValue = value + ':00';
        }
      } else if (value.length === 6) {
        formattedValue = value[0] + value[1] + ':' + value[2] + value[3] + ':' + value[4] + value[5] + '0';
      } else if (value.length === 7) {
        formattedValue = value[0] + value[1] + ':' + value[2] + value[3] + ':' + value[4] + value[5] + value[6] + '0';
      } else if (value.length === 8 && !(/^([0-2][0-9]):([0-5][0-9]):([0-5][0-9])?$/i.test(value))) {
        this.timeChanged.emit(value.substring(0, 6) + '00');
      }
      if (!((/^([0-2][0-9]):([0-5][0-9])?$/i.test(value)) || /^([0-2][0-9]):([0-5][0-9]):([0-5][0-9])?$/i.test(value))) {
        this.timeChanged.emit('00:00:00');
      }
    }
  }

  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v) {
      if (/^\s*$/i.test(v) ||
        /^(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)\s*$/.test(v)
        || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]\s*$/i.test(v)
        || v === '24:00'
        || v === '24:00:00'
        || /^\s*\d+\s*$/i.test(v) || this.regex.test(v)
      ) {
        return null;
      }
    } else {
      return null;
    }
    return {
      validTimeReqex: true
    };
  }
}


@Directive({
  selector: '[timeRelativeValidatorReqex]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => TimeValidatorRelativeReqexDirective), multi: true }
  ]
})
export class TimeValidatorRelativeReqexDirective implements Validator {

  regex = /^(?:(\d+)h\s*,?\s*)?(?:(\d+)m\s*,?\s*)?(?:(\d+)s)?$/;
  isEnter = false;
  isBackslash = false;

  @HostListener('keydown', ['$event'])
  onKeyPress(event): void {
    if (event.key === 'Enter' || event.which === 13) {
      this.isEnter = true;
      event.stopPropagation();
      event.preventDefault();
    }
    if (event.key === 'Backspace' || event.which === 8) {
      this.isBackslash = true;
    }
  }

  @HostListener('input', ['$event.target'])
  onInputChange(target): void {
    if (this.isEnter || this.isBackslash) {
      this.isEnter = false;
      this.isBackslash = false;
      return;
    } else {
      if (target.value) {
        if (target.value.length === 2 && /^([0-2][0-9])?$/i.test(target.value)) {
          if (parseInt(target.value) <= 24) {
            target.value += ':';
          }
        } else if (target.value.length === 5 && /^([0-2][0-9]):([0-5][0-9])?$/i.test(target.value)) {
          target.value += ':';
        }
      }
    }
  }

  @HostListener('focusout', ['$event.target'])
  onFocusout(target): void {
    const value = target.value.trim();

    const matches = this.regex.exec(value);
    if (!value) {
      target.value = '';
      return;
    }
    if (matches) {
      let hours = parseInt(matches[1] || '0', 10);
      let minutes = parseInt(matches[2] || '0', 10);
      let seconds = parseInt(matches[3] || '0', 10);

      minutes += Math.floor(seconds / 60);
      seconds = seconds % 60;

      hours += Math.floor(minutes / 60);
      minutes = minutes % 60;

      if (hours < 24 || (hours === 24 && minutes === 0 && seconds === 0)) {
        const formattedValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        target.value = formattedValue;
      } else {
        target.value = '00:00:00';
      }
    } else {
      let formattedValue = value;
      if (value.length === 3) {
        formattedValue = value[0] + value[1] + ':0' + value[2] + ':00';
      } else if (value.length === 4) {
        formattedValue = value[0] + value[1] + ':' + value[2] + value[3] + ':00';
      } else if (value.length === 5) {
        if (!/^([0-2][0-9]):([0-5][0-9])?$/i.test(value)) {
          formattedValue = value.substring(0, 3);
        } else {
          formattedValue = value + ':00';
        }
      } else if (value.length === 6) {
        formattedValue = value[0] + value[1] + ':' + value[2] + value[3] + ':' + value[4] + value[5] + '0';
      } else if (value.length === 7) {
        formattedValue = value[0] + value[1] + ':' + value[2] + value[3] + ':' + value[4] + value[5] + value[6] + '0';
      } else if (value.length === 8 && !(/^([0-2][0-9]):([0-5][0-9]):([0-5][0-9])?$/i.test(value))) {
        target.value = value.substring(0, 6) + '00';
      }
      if (!((/^([0-2][0-9]):([0-5][0-9])?$/i.test(value)) || /^([0-2][0-9]):([0-5][0-9]):([0-5][0-9])?$/i.test(value))) {
        target.value = '00:00:00';
      }
    }
  }

  validate(c: AbstractControl): { [key: string]: any } {
    const v = c.value;
    if (v) {
      if (/^\s*$/i.test(v) ||
        /^(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)\s*$/.test(v) ||
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]\s*$/i.test(v) ||
        v === '24:00' ||
        v === '24:00:00' ||
        /^\s*\d+\s*$/i.test(v) || this.regex.test(v)
      ) {
        return null;
      }
    } else {
      return null;
    }
    return {
      validTimeReqex: true
    };
  }
}
