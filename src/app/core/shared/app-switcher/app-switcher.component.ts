import {Component, inject} from '@angular/core';
import {NgbDropdown, NgbDropdownAnchor, NgbDropdownMenu, NgbDropdownToggle} from "@ng-bootstrap/ng-bootstrap";
import {NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase} from "@angular/common";
import {RouterLink, RouterLinkActive} from "@angular/router";

@Component({
  selector: 'gms-app-switcher',
  standalone: true,
    imports: [NgbDropdown,
      ],
  templateUrl: './app-switcher.component.html',
  styleUrl: './app-switcher.component.scss'
})
export class AppSwitcherComponent    {

}
