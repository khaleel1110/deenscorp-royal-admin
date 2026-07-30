import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-aside-user-footer',
  imports: [],
  templateUrl: './aside-user-footer.html',
  styleUrl: './aside-user-footer.scss',
})
export class AsideUserFooter {
 /* router = inject(Router);
  private auth = inject(Auth);
  provider = new GoogleAuthProvider();
  user$ = user(this.auth);
  userSubscription: Subscription;
  userX: User | null = null;
  userImage?: string;

  constructor() {
    /!*    effect(() => {
          if (this.userX?.photoURL) {
            this.userImage = this.userX.photoURL;
          } else if (this.agent()?.imageUrl) {
            this.userImage = this.agent()?.imageUrl!;

          } else {
            this.userImage = `https://ui-avatars.com/api/?name=${this.userX?.displayName ?? 'Tibet'}&background=random`;
          }
        });*!/

    this.userSubscription = this.user$.subscribe((aUser: User | null) => {
      //handle user state changes here. Note, that user will be null if there is no currently logged in user.
      console.log(aUser);
      this.userX = aUser;
    });
  }

  logOut() {
    signOut(this.auth)
      .then(() => {
        // Sign-out successful.
        location.href = '/authentication';
        // this.router.navigate(['/authentication']);
        // alert('logged out successfully');
      })
      .catch((error) => {
        alert(error);
        // An error happened.
      });
  }*/
}
