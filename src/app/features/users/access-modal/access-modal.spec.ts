import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessModal } from './access-modal';

describe('AccessModal', () => {
  let component: AccessModal;
  let fixture: ComponentFixture<AccessModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessModal],
    }).compileComponents();

    fixture = TestBed.createComponent(AccessModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
