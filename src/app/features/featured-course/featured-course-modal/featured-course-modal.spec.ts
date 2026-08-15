import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedCourseModal } from './featured-course-modal';

describe('FeaturedCourseModal', () => {
  let component: FeaturedCourseModal;
  let fixture: ComponentFixture<FeaturedCourseModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedCourseModal],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturedCourseModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
