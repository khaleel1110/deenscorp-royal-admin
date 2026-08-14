import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardStat } from './dashboard-stat';

describe('DashboardStat', () => {
  let component: DashboardStat;
  let fixture: ComponentFixture<DashboardStat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardStat],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardStat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
