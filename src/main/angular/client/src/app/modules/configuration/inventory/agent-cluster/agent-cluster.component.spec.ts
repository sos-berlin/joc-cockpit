import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentClusterComponent } from './agent-cluster.component';

describe('ProcessClassComponent', () => {
  let component: AgentClusterComponent;
  let fixture: ComponentFixture<AgentClusterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentClusterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentClusterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
