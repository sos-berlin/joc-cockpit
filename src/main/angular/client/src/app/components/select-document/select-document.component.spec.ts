import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectDocumentComponent } from './select-document.component';

describe('SelectDocumentComponent', () => {
  let component: SelectDocumentComponent;
  let fixture: ComponentFixture<SelectDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
