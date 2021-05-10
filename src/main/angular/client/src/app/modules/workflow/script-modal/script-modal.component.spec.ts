import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptModalComponent } from './script-modal.component';

describe('ScriptModalComponent', () => {
  let component: ScriptModalComponent;
  let fixture: ComponentFixture<ScriptModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScriptModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScriptModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
