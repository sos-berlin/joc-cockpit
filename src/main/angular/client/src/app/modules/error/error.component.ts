import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {
  code: string;
  error: string;

  constructor(private router: Router, public translate: TranslateService) {
  }

  ngOnInit() {
    const self = this;
    this.code = this.router.url === '/error' ? '403' : '404';
    this.translate.get('message.' + this.code).subscribe(translatedValue => {
      self.error = translatedValue;
    });
  }

  backHome() {
    this.router.navigate(['/dashboard']);
  }
}
