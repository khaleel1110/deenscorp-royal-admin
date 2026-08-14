import { TestBed } from '@angular/core/testing';

import { ProgramVenue } from './program-venue';

describe('ProgramVenue', () => {
  let service: ProgramVenue;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgramVenue);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
