import {Component, inject} from '@angular/core';
import {
  NgbDropdown,
  NgbDropdownAnchor, NgbDropdownButtonItem,
  NgbDropdownItem,
  NgbDropdownMenu,
  NgbDropdownToggle
} from "@ng-bootstrap/ng-bootstrap";
import {Auth, getIdToken, signOut, User, user} from "@angular/fire/auth";
import {Router} from "@angular/router";
import {GoogleAuthProvider} from "firebase/auth";
import {Subscription} from "rxjs";
import {JsonPipe} from "@angular/common";
import { IdentityService } from '../../../services/identity-service/identity.service';


@Component({
  selector: 'yex-user-profile',
  standalone: true,
  imports: [NgbDropdown, NgbDropdownMenu, NgbDropdownButtonItem],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent {
  router = inject(Router);
  private auth = inject(Auth);
  provider = new GoogleAuthProvider();
  user$ = user(this.auth);
  userSubscription: Subscription;
  userX: User | null = null;

  identityService: IdentityService = inject(IdentityService);
  companyId = this.identityService.companyId;
  company = this.identityService.company;

  constructor() {
    this.userSubscription = this.user$.subscribe((aUser: User | null) => {
      //handle user state changes here. Note, that user will be null if there is no currently logged in user.

      if (aUser) {
        localStorage.setItem('currentUserId', aUser.uid);
        /// alert('auser set to local storage'+aUser.uid);
        getIdToken(aUser, true)
          .then(function (idToken) {
            // Send token to your backend via HTTPS
            localStorage.setItem('currentFirebaseUserIdToken', idToken);
            //  console.log("idToken", idToken);
          })
          .catch(function (error) {
            // Handle error
          });
      }
      console.log(aUser);
      this.userX = aUser;
    });
  }

  logOut() {
    signOut(this.auth)
      .then(() => {
        // Sign-out successful.
        // alert('logged out successfully');
      })
      .catch((error) => {
        // alert(error);
        // An error happened.
      });
  }
}
