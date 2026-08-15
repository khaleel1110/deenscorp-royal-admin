import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingVenueModal } from './training-venue-modal';

describe('TrainingVenueModal', () => {
  let component: TrainingVenueModal;
  let fixture: ComponentFixture<TrainingVenueModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingVenueModal],
    }).compileComponents();

    fixture = TestBed.createComponent(TrainingVenueModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
