import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterClusterComponent } from './master-cluster.component';

describe('MasterClusterComponent', () => {
  let component: MasterClusterComponent;
  let fixture: ComponentFixture<MasterClusterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MasterClusterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterClusterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
