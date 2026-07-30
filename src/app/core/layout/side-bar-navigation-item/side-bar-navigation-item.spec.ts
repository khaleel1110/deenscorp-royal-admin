import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideBarNavigationItem } from './side-bar-navigation-item';

describe('SideBarNavigationItem', () => {
  let component: SideBarNavigationItem;
  let fixture: ComponentFixture<SideBarNavigationItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideBarNavigationItem],
    }).compileComponents();

    fixture = TestBed.createComponent(SideBarNavigationItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
