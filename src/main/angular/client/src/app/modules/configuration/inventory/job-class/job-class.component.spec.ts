import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobClassComponent } from './job-class.component';

describe('JobClassComponent', () => {
  let component: JobClassComponent;
  let fixture: ComponentFixture<JobClassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobClassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
