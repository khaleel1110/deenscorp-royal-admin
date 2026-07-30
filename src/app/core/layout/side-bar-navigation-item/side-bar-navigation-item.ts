// side-bar-navigation-item.ts
import { Component, Input, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SideNavigation } from '../side-navigation';
import { environment } from '../../../../environments/environment';
import { NavigationType, SubNavigationType } from '../../shared/models/navigation-type.model';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-side-bar-navigation-item',
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './side-bar-navigation-item.html',
})
export class SideBarNavigationItem {
  @Input({ required: true }) sideNavData: SideNavigation[] = [];
  protected readonly Number = Number;
  protected readonly env = environment;

  @Input() subNavigationList?: SubNavigationType[] = [];
  @Input() subNavigationTitle: string = "";
  protected mainNavigation: NavigationType[] = [];

  // Fix: Change from method to input property
  showAside = input.required<boolean>();

  // Or if you want to keep it as a method:
  // @Input() showAside: boolean = true;
}
