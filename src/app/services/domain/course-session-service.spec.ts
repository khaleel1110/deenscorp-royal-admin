import { TestBed } from '@angular/core/testing';

import { CourseSessionService } from './course-session-service';

describe('CourseSessionService', () => {
  let service: CourseSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourseSessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
