import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectApplicationModal } from './reject-application-modal';

describe('RejectApplicationModal', () => {
  let component: RejectApplicationModal;
  let fixture: ComponentFixture<RejectApplicationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejectApplicationModal],
    }).compileComponents();

    fixture = TestBed.createComponent(RejectApplicationModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
