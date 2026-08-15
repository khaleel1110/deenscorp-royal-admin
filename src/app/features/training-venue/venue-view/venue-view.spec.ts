import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueView } from './venue-view';

describe('VenueView', () => {
  let component: VenueView;
  let fixture: ComponentFixture<VenueView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueView],
    }).compileComponents();

    fixture = TestBed.createComponent(VenueView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
