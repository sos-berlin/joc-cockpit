import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JunctionComponent } from './junction.component';

describe('JunctionComponent', () => {
  let component: JunctionComponent;
  let fixture: ComponentFixture<JunctionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JunctionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JunctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
