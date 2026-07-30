// layout.component.ts
import {NgProgress, NgProgressComponent, NgProgressRef} from "ngx-progressbar";
import { AfterViewInit, Component, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IdentityService } from '../../services/identity-service/identity.service';
import { Location, NgClass } from '@angular/common';
import {
  ChildActivationEnd,
  ChildActivationStart,
  NavigationError,
  NavigationStart,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { ProjectSwitcher } from './project-switcher/project-switcher';
import { NotificationComponent } from '../shared/notification/notification.component';
import { UserProfileComponent } from '../shared/user-profile/user-profile.component';
import { TenantService } from '../../services/tenant/tenant.service';

import { GmsNavigationList, GmsSubNavigationList } from './side-navigation-list';
import { SideNavigationComponent } from '../shared/side-navigation/side-navigation.component';
import { MenuComponent } from '../shared/menu/menu.component';
import { AppSwitcherComponent } from '../shared/app-switcher/app-switcher.component';
import { ToastNotificationComponent } from '../../services/notification/toast-notification/toast-notification.component';
import { SideNavigation } from './side-navigation';

@Component({
  selector: 'app-layout',
  imports: [
    RouterLink,
    UserProfileComponent,
    RouterOutlet,
    SideNavigationComponent,
    MenuComponent,
    AppSwitcherComponent,
    ToastNotificationComponent,
    NgClass,
    NgProgressComponent,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  locService = inject(Location);
  env = environment;
  dp: any;
  closeResult: any;
  showAside: boolean = true;
  protected readonly open = open;
  identityService: IdentityService = inject(IdentityService);
  tenantService = inject(TenantService);

  companyId = this.identityService.companyId;
  company = this.identityService.company;

  toggleAside() {
    this.showAside = !this.showAside;
  }

  progressRef: NgProgressRef | any;

  constructor(private router: Router) {
    // Remove NgProgress injection and manually create progress reference
    this.progressRef = {
      start: () => {},
      complete: () => {},
      set: () => {},
      inc: () => {},
    };

    router.events.subscribe((e) => {
      if (e instanceof NavigationStart) {
        this.progressRef.start();
      }

      if (e instanceof NavigationError) {
        console.log(e);
        console.error('Navigation error');
      }
      if (e instanceof ChildActivationStart) {
        this.progressRef.start();
      } else if (e instanceof ChildActivationEnd) {
        setTimeout(() => {
          this.progressRef.complete();
        }, 200);
      }
    });
  }

  PreviousRoute() {
    this.locService.back();
  }

  mainNavigationList = GmsNavigationList;
  subNavigationList = GmsSubNavigationList;
  protected sideNavigation: SideNavigation[] | any;
}
