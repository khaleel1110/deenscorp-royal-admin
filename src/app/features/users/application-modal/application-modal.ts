import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import {
  CourseApplication,
  CourseApplicationService,
} from '../../../services/domain/course-application';

@Component({
  selector: 'app-application-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './application-modal.html',
  styleUrl: './application-modal.scss',
})
export class ApplicationModal implements OnInit {
  @Input() application?: CourseApplication;

  readonly activeModal = inject(NgbActiveModal);
  private readonly fb = inject(FormBuilder);
  private readonly applicationService = inject(CourseApplicationService);

  form!: FormGroup;
  readonly saving = signal(false);
  readonly error = signal('');

  get isVirtual(): boolean {
    const mode = this.application?.deliveryMode?.toLowerCase() ?? '';
    return mode.includes('virtual') || mode.includes('online');
  }

  get isPaid(): boolean {
    return this.application?.paymentStatus === 'paid';
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName: [this.application?.fullName ?? '', Validators.required],
      email: [this.application?.email ?? '', [Validators.required, Validators.email]],
      phone: [this.application?.phone ?? '', Validators.required],
      organization: [this.application?.organization ?? ''],
      message: [this.application?.message ?? ''],
      adminNotes: [this.application?.adminNotes ?? ''],
      meetingLink: [this.application?.meetingLink ?? ''],
      accessNotes: [this.application?.accessNotes ?? ''],
    });
  }

  async save(): Promise<void> {
    if (this.form.invalid || !this.application) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');

    try {
      const v = this.form.value;

      await this.applicationService.update(this.application.id, {
        fullName: v.fullName,
        email: v.email,
        phone: v.phone,
        organization: v.organization || null,
        message: v.message || null,
        adminNotes: v.adminNotes || null,
      });

      // Meeting link/access notes go through their own setter — a Cloud
      // Function watches this specific write to fire the access-details
      // email exactly once, only after payment is confirmed.
      const linkChanged =
        v.meetingLink !== (this.application.meetingLink ?? '') ||
        v.accessNotes !== (this.application.accessNotes ?? '');

      if (linkChanged) {
        await this.applicationService.setMeetingLink(
          this.application.id,
          v.meetingLink,
          v.accessNotes || undefined,
        );
      }

      this.activeModal.close(true);
    } catch (err: any) {
      console.error('Failed to save application:', err);
      this.error.set(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.activeModal.dismiss();
  }
}
