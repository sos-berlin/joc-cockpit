import { ComponentFixture, TestBed } from '@angular/core/testing';

import { APIServerStatusComponent } from './api-server-status.component';

describe('APIServerStatusComponent', () => {
  let component: APIServerStatusComponent;
  let fixture: ComponentFixture<APIServerStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ APIServerStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(APIServerStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
