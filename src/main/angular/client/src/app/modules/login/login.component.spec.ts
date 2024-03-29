import { waitForAsync, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppModule } from 'src/app/app.module';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Injector } from '@angular/core';
import { LoginComponent } from './login.component';
import { By } from '@angular/platform-browser';


declare var require: any;
const ENGLISH = require('../../../assets/i18n/en.json')
class HttpLoaderFactory implements TranslateLoader {
    getTranslation(lang: string): Observable<any> {
      return of(ENGLISH);
    }
}
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let translate: TranslateService;
  let injector: Injector;
  let element: HTMLElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterTestingModule,
        AppModule,

        TranslateModule.forRoot({
            loader: {
              provide: TranslateLoader,
              useClass: HttpLoaderFactory,
            }
          })
      ],
      declarations: [ LoginComponent ],
    })
    .compileComponents();
    injector = getTestBed();
    translate = injector.get(TranslateService);
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    translate.use('en');
    fixture.detectChanges();
  });

  it('should create the login', waitForAsync(() => {
    expect(component).toBeTruthy();
  }));
 
  it('should render title', waitForAsync(() => {
    const compiled = fixture.nativeElement as HTMLElement;
    console.log(compiled.querySelector('button')?.textContent)
    expect(compiled.querySelector('button')?.textContent).toContain('Log In');
  }));

  it('should have three input fields', waitForAsync(() => {
    const compiled = fixture.nativeElement as HTMLElement;
    console.log(compiled.querySelectorAll('input'))
    expect(compiled.querySelectorAll('input')?.length).toEqual(3);
  }));

  it('should have email field', waitForAsync(() => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#account')).toBeDefined();
  }));

  it('Should have initial form values for login', waitForAsync(() => {
    const user = component.user;
    expect(user).toEqual({});
  }));

  it('Should call onSubmit method', waitForAsync(() => {
    fixture.detectChanges();
    spyOn(component,'onSubmit');
    element=fixture.debugElement.query(By.css('Login')).nativeElement;
    element.click();
    expect(component.onSubmit).toHaveBeenCalledTimes(0);
  }));

  

});
