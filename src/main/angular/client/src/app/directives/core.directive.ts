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
      $('.list-dropdown').css({top: top + 'px', left: left + 'px'});
      window.addEventListener('scroll', this.scroll, true);
    } else {
      window.removeEventListener('scroll', this.scroll, true);
    }
  }

  scroll = (): void => {
    if (this.el.nativeElement.attributes.class.value.match(' open')) {
      $('div.open .list-dropdown').css({top: this.el.nativeElement.getBoundingClientRect().top + 16 + 'px'});
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
          resize: function () {
            $('#rightPanel').css('margin-left', dom.width() + 20 + 'px');
          }
        });
      }
    } else if (this.el.nativeElement.attributes.class.value.match('editor')) {
      dom = $('#leftSidePanel');
      if (dom) {
        dom.css('top', '143px');
        dom.resizable({
          handles: 'e',
          maxWidth: 500,
          minWidth: 10,
          resize: function () {
            $('#centerPanel').css({'margin-left': dom.width() + 45 + 'px'});
          }
        });
      }
    }
  }

}
