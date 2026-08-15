import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedCourseList } from './featured-course-list';

describe('FeaturedCourseList', () => {
  let component: FeaturedCourseList;
  let fixture: ComponentFixture<FeaturedCourseList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedCourseList],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturedCourseList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
