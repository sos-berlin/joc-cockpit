import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DependenciesComponent } from './dependencies.component';

describe('DependenciesComponent', () => {
  let component: DependenciesComponent;
  let fixture: ComponentFixture<DependenciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DependenciesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DependenciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
