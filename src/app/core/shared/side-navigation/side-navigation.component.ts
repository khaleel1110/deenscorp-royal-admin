// side-navigation.component.ts
import { Component, inject, Input, input } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { main } from '@popperjs/core';
import { NgClass } from '@angular/common';
import { Auth, signOut, User, user } from '@angular/fire/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../services/notification/toast.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SubNavigationType } from '../models/navigation-type.model';
import { IdentityService } from '../../../services/identity-service/identity.service';
import {AsideUserFooter} from '../../layout/aside-user-footer/aside-user-footer';

// Define the NavigationType interface if not imported
export interface NavigationType {
  label: string;
  icon?: string;
  matches: string;
  matchExact?: boolean;
  disabled?: boolean;
  badge?: {
    tone: string;
    text: string;
  };
  secondaryAction?: {
    accessibilityLabel?: string;
    icon: string;
    tooltip: {
      content: string;
    };
  };
  subNavigationItems?: NavigationType[];
  collapsedSubNavigationItems?: boolean;
  onClick?: () => void;
  href?: string;
  iconUrl?: string;
}

@Component({
  selector: 'yex-side-navigation',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass, AsideUserFooter],
  templateUrl: './side-navigation.component.html',
  styleUrl: './side-navigation.component.scss',
})
export class SideNavigationComponent {
  toastService = inject(ToastService);
  modalService = inject(NgbModal);

  showAside = input.required<boolean>();
  protected readonly env = environment;
  @Input() mainNavigation: NavigationType[] = [];
  @Input() subNavigationList?: SubNavigationType[] = [];
  @Input() subNavigationTitle: string = '';
  protected readonly main = main;

  identityService: IdentityService = inject(IdentityService);
  companyId = this.identityService.companyId;
  company = this.identityService.company;
  isLoading = this.identityService.isLoading;

  router = inject(Router);
  private auth = inject(Auth);
  provider = new GoogleAuthProvider();
  user$ = user(this.auth);
  userSubscription: Subscription;
  userX: User | null = null;

  constructor() {
    this.userSubscription = this.user$.subscribe((aUser: User | null) => {
      //handle user state changes here. Note, that user will be null if there is no currently logged in user.
      console.log(aUser);
      this.userX = aUser;
    });

    let actionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this
      // URL must be in the authorized domains list in the Firebase Console.
      url: 'https://www.example.com/finishSignUp?cartId=1234',
      // This must be true.
      handleCodeInApp: true,
      iOS: {
        bundleId: 'com.example.ios',
      },
      android: {
        packageName: 'com.example.android',
        installApp: true,
        minimumVersion: '12',
      },
      dynamicLinkDomain: 'example.page.link',
    };
  }

  logOut() {
    signOut(this.auth)
      .then(() => {
        // Sign-out successful.
        this.router.navigate(['/authentication']);
      })
      .catch((error) => {
        alert(error);
        // An error happened.
      });
  }

  protected readonly Number = Number;
}
