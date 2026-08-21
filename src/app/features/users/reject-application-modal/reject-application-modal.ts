import { Component, Input, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import {
  CourseApplication,
  CourseApplicationService,
} from '../../../services/domain/course-application';

@Component({
  selector: 'app-reject-application-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reject-application-modal.html',
  styleUrl: './reject-application-modal.scss',
})
export class RejectApplicationModal {
  @Input({ required: true })
  application!: CourseApplication;

  readonly activeModal = inject(NgbActiveModal);

  private readonly fb = inject(FormBuilder);

  private readonly applicationService = inject(CourseApplicationService);

  readonly saving = signal(false);

  readonly error = signal('');

  readonly form: FormGroup = this.fb.group({
    reason: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(1000)]],
  });

  async reject(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');

    try {
      const reason = this.form.get('reason')?.value?.trim();

      await this.applicationService.reject(this.application.id, reason);

      this.activeModal.close(true);
    } catch (err: any) {
      console.error('Failed to reject application:', err);

      this.error.set(err?.message ?? 'Failed to reject the application. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.activeModal.dismiss();
  }
}
