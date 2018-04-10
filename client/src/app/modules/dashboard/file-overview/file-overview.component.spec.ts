import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileOverviewComponent } from './file-overview.component';

describe('FileOverviewComponent', () => {
  let component: FileOverviewComponent;
  let fixture: ComponentFixture<FileOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
