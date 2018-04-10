import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskSummaryComponent } from './task-summary.component';

describe('TaskSummaryComponent', () => {
  let component: TaskSummaryComponent;
  let fixture: ComponentFixture<TaskSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
