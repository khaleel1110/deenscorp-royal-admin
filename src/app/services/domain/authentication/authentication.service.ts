import {inject, Injectable} from '@angular/core';
import {
  Auth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut
} from "@angular/fire/auth";
import {GoogleAuthProvider} from "firebase/auth";
import {Router} from "@angular/router";

const provider = new GoogleAuthProvider();

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);
  constructor() {
  }

  async loginWithEmailAndPassword(email: string, password: string): Promise<void> {
    try {
     const userCred = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCred.user;

    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  async signInWithGoogle(): Promise<void> {
    try {
      await signInWithRedirect(this.auth, provider);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }


  async forgotPassword(email: string): Promise<void> {
    const actionCodeSettings = {
      url: 'https://admin-tibet-realty.web.app/',
      // This must be true.
      handleCodeInApp: true,
    };
    try {
      await sendPasswordResetEmail(this.auth, email, actionCodeSettings)
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      await this.router.navigate(['/authentication']);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }
}
