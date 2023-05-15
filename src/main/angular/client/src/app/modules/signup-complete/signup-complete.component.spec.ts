import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupCompleteComponent } from './signup-complete.component';

describe('SignupCompleteComponent', () => {
  let component: SignupCompleteComponent;
  let fixture: ComponentFixture<SignupCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignupCompleteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
