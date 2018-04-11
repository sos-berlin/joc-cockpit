import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulerInstanceComponent } from './scheduler-instance.component';

describe('SchedulerInstanceComponent', () => {
  let component: SchedulerInstanceComponent;
  let fixture: ComponentFixture<SchedulerInstanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchedulerInstanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchedulerInstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
