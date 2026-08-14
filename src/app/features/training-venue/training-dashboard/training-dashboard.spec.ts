import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingDashboard } from './training-dashboard';

describe('TrainingDashboard', () => {
  let component: TrainingDashboard;
  let fixture: ComponentFixture<TrainingDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(TrainingDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
