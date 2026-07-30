import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsideUserFooter } from './aside-user-footer';

describe('AsideUserFooter', () => {
  let component: AsideUserFooter;
  let fixture: ComponentFixture<AsideUserFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsideUserFooter],
    }).compileComponents();

    fixture = TestBed.createComponent(AsideUserFooter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
