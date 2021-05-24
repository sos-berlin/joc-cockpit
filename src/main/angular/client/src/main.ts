import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './app/app.module';
import {environment} from './environments/environment';
import 'codemirror/mode/shell/shell';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/ruby/ruby';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/search/search';
import 'codemirror/addon/scroll/annotatescrollbar';
import 'codemirror/addon/search/matchesonscrollbar';
import 'codemirror/addon/search/jump-to-line';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
