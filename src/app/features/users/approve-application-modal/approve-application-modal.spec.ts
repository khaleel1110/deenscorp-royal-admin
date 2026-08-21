import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveApplicationModal } from './approve-application-modal';

describe('ApproveApplicationModal', () => {
  let component: ApproveApplicationModal;
  let fixture: ComponentFixture<ApproveApplicationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproveApplicationModal],
    }).compileComponents();

    fixture = TestBed.createComponent(ApproveApplicationModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
