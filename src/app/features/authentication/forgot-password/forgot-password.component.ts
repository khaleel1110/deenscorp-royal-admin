import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  private auth = inject(Auth);
  private router = inject(Router);

  // State signals
  readonly loading = signal(false);
  readonly emailSent = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // Form
  forgotPasswordForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  /** Send password reset email */
  async handleForgotPassword(): Promise<void> {
    const control = this.forgotPasswordForm.controls.email;
    if (control.invalid) {
      control.markAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      await sendPasswordResetEmail(this.auth, control.value as string);
      this.emailSent.set(true);
    } catch (error: any) {
      // User-friendly error messages
      const code = error.code;
      switch (code) {
        case 'auth/user-not-found':
          this.errorMessage.set('No account found with this email address.');
          break;
        case 'auth/invalid-email':
          this.errorMessage.set('Please enter a valid email address.');
          break;
        case 'auth/too-many-requests':
          this.errorMessage.set('Too many requests. Please try again later.');
          break;
        default:
          this.errorMessage.set(error.message || 'Something went wrong. Please try again.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
