import {AfterViewInit, Directive, ElementRef, forwardRef, HostListener, Input, OnChanges, OnInit} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, NgModel, Validator} from '@angular/forms';
import {SaveService} from '../services/save.service';

declare const $;

@Directive({
  selector: '[timevalidator][ngModel]',
  providers: [NgModel]
})
export class TimeValidatorDirective {

  constructor(private model: NgModel) {
  }

  @HostListener('input', ['$event.target'])
  onInputChange(target) {
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

  @HostListener('focusout', ['$event.target'])
  onFocusout(target) {
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
  selector: '[validateReqex][formControlName],[validateReqex][formControl],[validateReqex][ngModel]',
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
  selector: '[validateDailyPlanReqex][formControlName],[validateDailyPlanReqex][formControl],[validateDailyPlanReqex][ngModel]',
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
  selector: '[validTimeReqex][formControlName],[validTimeReqex][formControl],[validTimeReqex][ngModel]',
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
  selector: '[validateNumberArrayReqex][formControlName],[validateNumberArrayReqex][formControl],[validateNumberArrayReqex][ngModel]',
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
      if (/^(\d{1,3})(,\d{1,3})*(\d)?$/g.test(v)) {
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
  selector: '[validateDurtionReqex][formControlName],[validateDurtionReqex][formControl],[validateDurtionReqex][ngModel]',
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
  selector: '[identifierValidation][formControlName],[identifierValidation][formControl],[identifierValidation][ngModel]',
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

      if (!v.match(/[!?~'"}\[\]{@:#\/\\^$%\^\&*\)\(+=]/) && /^(?!\.)(?!.*\.$)(?!.*?\.\.)/.test(v)
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
  selector: '[envVariableValidation][formControlName],[envVariableValidation][formControl],[envVariableValidation][ngModel]',
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
        if (/^(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|double|do|else|enum|extends|false|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|null|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while)$/.test(v)) {
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
  selector: '[labelValidation][formControlName],[labelValidation][formControl],[labelValidation][ngModel]',
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
      if (!v.match(/[?~'"}\[\]{@\/\\^%\^\&*\)\(+=]/) && /^(?!\.)(?!.*\.$)(?!.*?\.\.)/.test(v)
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
export class ResizableDirective implements OnInit {
  @Input() height: string;
  @Input() type: string;
  @Input() path: string;
  @Input() sideView: any;
  @Input() workflowTab: any;

  constructor(private el: ElementRef, private saveService: SaveService) {
  }

  ngOnInit(): void {
    let dom: any;
    if (this.el.nativeElement.attributes.class.value.match('resizable')) {
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
              let rsHt = JSON.parse(this.saveService.resizerHeight) || {};
              if (rsHt[this.type] && typeof rsHt[this.type] === 'object') {
                rsHt[this.type][this.path] = x.size.height;
              } else {
                rsHt[this.type] = {};
              }
              rsHt[this.type][this.path] = x.size.height;
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
    } else if (this.el.nativeElement.attributes.class.value.match('sidebar-property-panel')) {
      dom = $('#property-panel');
      if (dom) {
        dom.resizable({
          minWidth: 22,
          maxWidth: 768,
          handles: 'w',
          resize: (e, x) => {
            const wt = x.size.width;
            $('#outlineContainer').css({right: wt + 10 + 'px'});
            $('.graph-container').css({'margin-right': wt + 'px'});
            $('.bottom-btn').css({right: wt + 22 + 'px'});
            $('.toolbar').css({'margin-right': (wt - 12) + 'px'});
            $('.sidebar-close').css({right: wt + 'px'});
            localStorage.propertyPanelWidth = wt;
            if (wt > 349) {
              $('#btn-text').show();
            } else {
              $('#btn-text').hide();
            }
          }
        });
      }
    } else {
      dom = $('#' + this.el.nativeElement.attributes.id.value);
      if (dom) {
        dom.css('top', '191px');
        if (this.sideView && this.sideView.width) {
          dom.css('width', this.sideView.width + 'px');
          $('#rightPanel').css({'margin-left': this.sideView.width + 18 + 'px'});
        }
        dom.resizable({
          handles: 'e',
          minWidth: 22,
          maxWidth: 1024,
          resize: (e, x) => {
            let wt = dom.width();
            $('#rightPanel').css({'margin-left': wt + 18 + 'px'});
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

  ngAfterViewInit() {
    if (this.appAutoFocus) {
      setTimeout(() => {
        if (this.el.nativeElement.attributes.class.value.match('input-number')) {
          $('.ant-input-number input').focus();
        }
        this.el.nativeElement.focus();
      }, 0);
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

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.name.node) {
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

  ngOnChanges() {
    setTimeout(() => {
      if (this.name.node) {
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
