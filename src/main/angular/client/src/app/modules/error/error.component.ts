import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {
  code = '403';
  error: string;

  constructor(private router: Router, public translate: TranslateService) {
  }

  ngOnInit() {
    const self = this;
    this.translate.get('message.403').subscribe(translatedValue => {
      self.error = translatedValue;
    });
  }

  backHome() {
    this.router.navigate(['/dashboard']);
  }
}
@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class PageNotFoundComponent implements OnInit {
  code = '404';
  error: string;

  constructor(private router: Router, public translate: TranslateService) {
  }

  ngOnInit() {
    const self = this;
    this.translate.get('message.404').subscribe(translatedValue => {
      self.error = translatedValue;
    });
  }

  backHome() {
    this.router.navigate(['/dashboard']);
  }
}
