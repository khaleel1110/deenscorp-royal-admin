import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTraining } from './add-training';

describe('AddTraining', () => {
  let component: AddTraining;
  let fixture: ComponentFixture<AddTraining>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTraining],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTraining);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
