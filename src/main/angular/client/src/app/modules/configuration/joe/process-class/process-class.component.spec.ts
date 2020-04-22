import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessClassComponent } from './process-class.component';

describe('ProcessClassComponent', () => {
  let component: ProcessClassComponent;
  let fixture: ComponentFixture<ProcessClassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessClassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
