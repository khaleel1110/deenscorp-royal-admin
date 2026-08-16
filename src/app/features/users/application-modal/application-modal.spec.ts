import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationModal } from './application-modal';

describe('ApplicationModal', () => {
  let component: ApplicationModal;
  let fixture: ComponentFixture<ApplicationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationModal],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
