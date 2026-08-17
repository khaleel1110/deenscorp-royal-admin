import { TestBed } from '@angular/core/testing';

import { GoogleMeetServices } from './google-meet-services';

describe('GoogleMeetServices', () => {
  let service: GoogleMeetServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleMeetServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
