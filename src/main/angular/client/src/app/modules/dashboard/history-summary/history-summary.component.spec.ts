import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorySummaryComponent } from './history-summary.component';

describe('OrderSummaryComponent', () => {
  let component: HistorySummaryComponent;
  let fixture: ComponentFixture<HistorySummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistorySummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
