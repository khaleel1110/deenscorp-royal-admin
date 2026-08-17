import { ChangeDetectionStrategy, Component, inject, signal, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  Auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
} from '@angular/fire/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { user } from '@angular/fire/auth';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'yex-login',
  standalone: true,
  imports: [ReactiveFormsModule, JsonPipe, RouterLinkActive, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnDestroy {
  private auth = inject(Auth);
  private router = inject(Router);

  // State signals
  readonly loading = signal(false);
  readonly loginError = signal<string | null>(null);
  passwordVisible = false;

  // User subscription
  private userSubscription: Subscription;
  userX: User | null = null;

  // Google provider
  provider = new GoogleAuthProvider();

  // Environment
  env = {
    websiteLink: 'https://ideasbelifantel.ng',
  };

  // Form
  profileForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(30),
    ]),
    rememberMe: new FormControl(false),
  });

  constructor() {
    this.userSubscription = user(this.auth).subscribe((aUser: User | null) => {
      this.userX = aUser;
    });
  }

  /** Toggle password visibility */
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  /** Handle email/password sign-in */
  async handleSubmit(): Promise<void> {
    const emailControl = this.profileForm.controls.email;
    const passwordControl = this.profileForm.controls.password;

    if (this.profileForm.invalid) {
      emailControl.markAsTouched();
      passwordControl.markAsTouched();
      return;
    }

    this.loading.set(true);
    this.loginError.set(null);

    try {
      await signInWithEmailAndPassword(
        this.auth,
        emailControl.value as string,
        passwordControl.value as string,
      );
      this.router.navigate(['/deenscorp/dashboard']);
    } catch (error: any) {
      const code = error.code;
      switch (code) {
        case 'auth/user-not-found':
          this.loginError.set('No account found with this email.');
          break;
        case 'auth/wrong-password':
          this.loginError.set('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          this.loginError.set('Please enter a valid email address.');
          break;
        case 'auth/too-many-requests':
          this.loginError.set('Too many failed attempts. Please try again later.');
          break;
        default:
          this.loginError.set(error.message || 'Sign-in failed. Please try again.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  /** Handle Google sign-in */
  async googlesignin(): Promise<void> {
    this.loading.set(true);
    this.loginError.set(null);

    try {
      await signInWithPopup(this.auth, this.provider);
      this.router.navigate(['/deenscorp/dashboard']);
    } catch (error: any) {
      const code = error.code;
      switch (code) {
        case 'auth/popup-closed-by-user':
          this.loginError.set('Sign-in cancelled. Please try again.');
          break;
        case 'auth/account-exists-with-different-credential':
          this.loginError.set('An account already exists with a different sign-in method.');
          break;
        default:
          this.loginError.set(error.message || 'Google sign-in failed.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  /** Sign out (kept for reference) */
  async logOut(): Promise<void> {
    try {
      await signOut(this.auth);
      // Optionally show a toast or notification
    } catch (error: any) {
      // Handle error
    }
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }
}
