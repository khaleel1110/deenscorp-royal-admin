import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import {
  ApplicationPurpose,
  CourseApplication,
  CourseApplicationService,
} from '../../../services/domain/course-application';

const PURPOSE_OPTIONS: ApplicationPurpose[] = [
  'Personal Development',
  'Company Sponsored',
  'Career Change',
  'Academic / Research',
  'Other',
];

@Component({
  selector: 'app-application-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './application-modal.html',
  styleUrl: './application-modal.scss',
})
export class ApplicationModal implements OnInit {
  @Input({ required: true }) application!: CourseApplication;

  readonly activeModal = inject(NgbActiveModal);
  private readonly fb = inject(FormBuilder);
  private readonly applicationService = inject(CourseApplicationService);

  readonly purposeOptions = PURPOSE_OPTIONS;

  form!: FormGroup;
  readonly saving = signal(false);
  readonly error = signal('');

  ngOnInit(): void {
    // Every field on CourseApplication that's editable lives here — this
    // form is the single source of truth for "Edit", so a save never
    // silently drops data the applicant originally submitted.
    this.form = this.fb.group({
      fullName: [this.application.fullName ?? '', Validators.required],
      email: [this.application.email ?? '', [Validators.required, Validators.email]],
      phone: [this.application.phone ?? '', Validators.required],
      organization: [this.application.organization ?? ''],
      jobTitle: [this.application.jobTitle ?? ''],

      purpose: [this.application.purpose ?? 'Personal Development'],
      isSponsored: [this.application.isSponsored ?? false],
      sponsorName: [this.application.sponsorName ?? ''],
      sponsorEmail: [this.application.sponsorEmail ?? ''],
      sponsorPhone: [this.application.sponsorPhone ?? ''],

      message: [this.application.message ?? ''],
      adminNotes: [this.application.adminNotes ?? ''],
    });

    this.form.get('isSponsored')?.valueChanges.subscribe((sponsored: boolean) => {
      const sponsorNameCtrl = this.form.get('sponsorName');
      if (sponsored) {
        sponsorNameCtrl?.setValidators([Validators.required]);
      } else {
        sponsorNameCtrl?.clearValidators();
      }
      sponsorNameCtrl?.updateValueAndValidity();
    });
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
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
        jobTitle: v.jobTitle || null,
        purpose: v.purpose,
        isSponsored: !!v.isSponsored,
        sponsorName: v.isSponsored ? v.sponsorName || null : null,
        sponsorEmail: v.isSponsored ? v.sponsorEmail || null : null,
        sponsorPhone: v.isSponsored ? v.sponsorPhone || null : null,
        message: v.message || null,
        adminNotes: v.adminNotes || null,
      });

      this.activeModal.close(true);
    } catch (err: any) {
      // Form state is left exactly as the admin typed it — nothing is
      // cleared or reset on failure, so they can fix the issue (e.g. a
      // transient network error) and hit Save again without retyping.
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
