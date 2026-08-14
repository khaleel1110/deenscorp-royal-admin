import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursePerformance } from './course-performance';

describe('CoursePerformance', () => {
  let component: CoursePerformance;
  let fixture: ComponentFixture<CoursePerformance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursePerformance],
    }).compileComponents();

    fixture = TestBed.createComponent(CoursePerformance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
