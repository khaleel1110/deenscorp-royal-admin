import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PieChartDashboard } from './pie-chart-dashboard';

describe('PieChartDashboard', () => {
  let component: PieChartDashboard;
  let fixture: ComponentFixture<PieChartDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PieChartDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(PieChartDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
