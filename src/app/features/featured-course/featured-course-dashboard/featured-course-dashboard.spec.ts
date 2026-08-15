import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedCourseDashboard } from './featured-course-dashboard';

describe('FeaturedCourseDashboard', () => {
  let component: FeaturedCourseDashboard;
  let fixture: ComponentFixture<FeaturedCourseDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedCourseDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturedCourseDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
