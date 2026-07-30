import { TestBed } from '@angular/core/testing';

import { CourseCategory } from './course-category';

describe('CourseCategory', () => {
  let service: CourseCategory;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourseCategory);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
