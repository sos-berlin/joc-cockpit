import {Directive, HostListener, forwardRef, OnInit, OnDestroy, ElementRef} from '@angular/core';
import {AbstractControl, NgModel, Validator, NG_VALIDATORS} from '@angular/forms';

declare const $;

@Directive({
  selector: '[timevalidator][ngModel]',
  providers: [NgModel]
})

export class TimeValidatorDirective implements OnInit {

  constructor(private model: NgModel) {
  }

  ngOnInit() {
    this.model.valueChanges.subscribe((event) => {
      if (event) {
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
            this.model.valueAccessor.writeValue(event.substring(0, 6) + '00');
          }
        }
      }
    });
  }

  @HostListener('focusout', ['$event.target'])
  onFocusout(target) {
    if (target.value) {
      if (target.value.substring(0, 2) === 24) {
        this.model.valueAccessor.writeValue('24:00:00');
      } else {
        if (target.value.length === 1) {
          this.model.valueAccessor.writeValue('');

        } else if (target.value.length === 3) {
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
        || /^\s*[-,+](\d+)(h|d|w|M|y)\s*$/.test(v)
        || /^\s*(now\s*[-,+])\s*(\d+)\s*$/i.test(v)
        || /^\s*(now)\s*$/i.test(v)
        || /^\s*(Today)\s*$/i.test(v)
        || /^\s*[-,+](\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.test(v)
      ) {
        return null;
      }
    }

    return {
      validateDailyPlanReqex: true
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
      validateNumberArrayReqex: true
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
      if(v ==''){
        return null;
      }
      if (/^([01][0-9]|2[0-3]):?([0-5][0-9]):?([0-5][0-9])\s*$/i.test(v) ||
        /^((\d+)y[ ]?)?((\d+)m[ ]?)?((\d+)w[ ]?)?((\d+)d[ ]?)?((\d+)h[ ]?)?((\d+)M[ ]?)?((\d+)s[ ]?)?|(\d{2}:\d{2}:\d{2})\s*$/.test(v)
      ) {
        return null;
      }
    } else {
      return null;
    }

    return {
      validateDurtionReqex: true
    };
  }
}

@Directive({
  selector: '[appDropdown]'
})
export class DropdownDirective implements OnDestroy {

  constructor(private el: ElementRef) {
  }

  @HostListener('click', ['$event'])
  click(event) {
    if ($(event.target).attr('class') !== 'dropdown-backdrop') {
      const top = event.clientY + 8;
      const left = event.clientX - 20;

      if (window.innerHeight > top + 200) {
        $('.list-dropdown').css({top: top + 'px', left: left + 'px', bottom: 'auto'})
          .removeClass('arrow-down reverse');
      } else {
        $('.list-dropdown').css({left: left + 'px', bottom: (window.innerHeight - top + 14) + 'px'
        }).addClass('reverse arrow-down');
      }
      window.addEventListener('scroll', this.scroll, true);
    } else {
      window.removeEventListener('scroll', this.scroll, true);
    }
  }

  scroll = (): void => {
    if (this.el.nativeElement.attributes.class.value.match(' open')) {
      if ($('div.open .list-dropdown').hasClass('arrow-down')) {
        $('div.open .list-dropdown').css({bottom: (window.innerHeight - this.el.nativeElement.getBoundingClientRect().top) + 'px'});
      } else {
        $('div.open .list-dropdown').css({top: this.el.nativeElement.getBoundingClientRect().top + 16 + 'px'});
      }
    }
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.scroll, true);
    window.removeEventListener('click', this.click, true);
  }

}

@Directive({
  selector: '[appResizable]'
})
export class ResizableDirective implements OnInit {

  constructor(private el: ElementRef) {
  }

  ngOnInit() {
    let dom: any;
    if (this.el.nativeElement.attributes.class.value.match('resource')) {
      dom = $('#leftPanel');
      if (dom) {
        dom.css('top', '191px');
        dom.resizable({
          handles: 'e',
          maxWidth: 450,
          minWidth: 180,
          resize: function (e, x) {
            $('#rightPanel').css('margin-left', x.size.width + 20 + 'px');
          }
        });
      }
    } else if (this.el.nativeElement.attributes.class.value.match('editor')) {
      dom = $('#leftSidePanel');
      if (dom) {
        dom.css('top', '191px');
        dom.resizable({
          handles: 'e',
          maxWidth: 500,
          minWidth: 22,
          resize: function (e, x) {
            $('#centerPanel').css({'margin-left': x.size.width + 'px'});
          }
        });
      }
    }else if (this.el.nativeElement.attributes.class.value.match('sidebar')) {
      const dom = $('#property-panel');
      if (dom) {
        if (dom) {
          dom.resizable({
            minWidth: 22,
            handles: 'w',
            resize: function (e, x) {
              const wt = x.size.width;
              $('#outlineContainer').css({'right': wt + 10 + 'px'});
              $('.graph-container').css({'margin-right': wt + 'px'});
              $('.toolbar').css({'margin-right': (wt - 12)  + 'px'});
              $('.sidebar-close').css({'right': wt + 'px'});
              sessionStorage.propertyPanelWidth = wt;
            }
          });
        }
      }
    }
  }
}
