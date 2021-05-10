import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentRunningTaskComponent } from './agent-running-task.component';

describe('AgentRunningTaskComponent', () => {
  let component: AgentRunningTaskComponent;
  let fixture: ComponentFixture<AgentRunningTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentRunningTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentRunningTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
