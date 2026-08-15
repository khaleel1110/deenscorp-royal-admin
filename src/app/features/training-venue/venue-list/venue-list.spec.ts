import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueList } from './venue-list';

describe('VenueList', () => {
  let component: VenueList;
  let fixture: ComponentFixture<VenueList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueList],
    }).compileComponents();

    fixture = TestBed.createComponent(VenueList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
