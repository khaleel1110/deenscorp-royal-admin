import { TestBed } from '@angular/core/testing';

import { CourseTopicService } from './course-topic-service';

describe('CourseTopicService', () => {
  let service: CourseTopicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourseTopicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
