import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationDashboard } from './application-dashboard';

describe('ApplicationDashboard', () => {
  let component: ApplicationDashboard;
  let fixture: ComponentFixture<ApplicationDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
