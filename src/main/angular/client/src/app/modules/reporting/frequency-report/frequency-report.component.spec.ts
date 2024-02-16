import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrequencyReportComponent } from './frequency-report.component';

describe('MonthlyComponent', () => {
  let component: FrequencyReportComponent;
  let fixture: ComponentFixture<FrequencyReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FrequencyReportComponent]
    });
    fixture = TestBed.createComponent(FrequencyReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
