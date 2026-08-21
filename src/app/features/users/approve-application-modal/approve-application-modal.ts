import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import {
  CourseApplication,
  CourseApplicationService,
} from '../../../services/domain/course-application';
import { CourseSession, CourseSessionService } from '../../../services/domain/course-session-service';
import { TrainingVenue, TrainingVenueService } from '../../../services/domain/program-venue';

@Component({
  selector: 'app-approve-application-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './approve-application-modal.html',
  styleUrl: './approve-application-modal.scss',
})
export class ApproveApplicationModal implements OnInit {
  @Input({ required: true }) application!: CourseApplication;

  readonly activeModal = inject(NgbActiveModal);
  private readonly fb = inject(FormBuilder);
  private readonly applicationService = inject(CourseApplicationService);
  private readonly sessionService = inject(CourseSessionService);
  private readonly venueService = inject(TrainingVenueService);

  form!: FormGroup;

  readonly session = signal<CourseSession | undefined>(undefined);
  readonly venue = signal<TrainingVenue | undefined>(undefined);
  readonly loadingSession = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');

  get isVirtual(): boolean {
    const mode = this.application.deliveryMode?.toLowerCase() ?? '';
    return mode.includes('virtual') || mode.includes('online');
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      currency: ['USD', Validators.required],
      overrideAmount: [false],
      accessSource: ['session'], // 'session' | 'custom'
      customMeetingLink: [''],
    });

    if (this.application.courseId && this.application.sessionId) {
      this.sessionService
        .getById(this.application.courseId, this.application.sessionId)
        .subscribe((session) => {
          this.session.set(session);
          this.loadingSession.set(false);

          if (session) {
            this.form.patchValue({
              amount: session.price ?? 0,
              currency: session.currency ?? 'USD',
            });

            if (session.venueId) {
              this.venueService.getById(session.venueId).subscribe((v) => this.venue.set(v));
            }
          }
        });
    } else {
      this.loadingSession.set(false);
    }
  }

  toggleOverride(): void {
    const overriding = this.form.get('overrideAmount')?.value;
    if (!overriding) {
      // Reset back to the session's authoritative price when un-checking.
      this.form.patchValue({
        amount: this.session()?.price ?? this.form.get('amount')?.value,
        currency: this.session()?.currency ?? this.form.get('currency')?.value,
      });
    }
  }

  async approve(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');

    try {
      const v = this.form.value;

      await this.applicationService.approve(this.application.id, Number(v.amount), v.currency);

      // Pre-set the access source so it's ready the moment payment clears.
      if (this.isVirtual) {
        const useSession = v.accessSource === 'session';
        await this.applicationService.setAccessDetails(this.application.id, {
          usesSessionMeetingLink: useSession,
          meetingLink: useSession ? this.session()?.meetingLink ?? null : v.customMeetingLink || null,
        });
      }

      this.activeModal.close(true);
    } catch (err: any) {
      console.error('Failed to approve application:', err);
      this.error.set(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.activeModal.dismiss();
  }
}
