import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobChainComponent } from './job-chain.component';

describe('JobChainComponent', () => {
  let component: JobChainComponent;
  let fixture: ComponentFixture<JobChainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobChainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobChainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
