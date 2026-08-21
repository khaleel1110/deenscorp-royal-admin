import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import {
  CourseApplication,
  CourseApplicationService,
} from '../../../services/domain/course-application';
import { CourseSession, CourseSessionService } from '../../../services/domain/course-session-service';
import { TrainingVenue, TrainingVenueService } from '../../../services/domain/program-venue';

@Component({
  selector: 'app-access-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './access-modal.html',
  styleUrl: './access-modal.scss',
})
export class AccessModal implements OnInit {
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

  get isPaid(): boolean {
    return this.application.paymentStatus === 'paid';
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      accessSource: [this.application.usesSessionMeetingLink === false ? 'custom' : 'session'],
      customMeetingLink: [
        this.application.usesSessionMeetingLink === false ? this.application.meetingLink ?? '' : '',
      ],
      accessNotes: [this.application.accessNotes ?? ''],
    });

    if (this.application.courseId && this.application.sessionId) {
      this.sessionService
        .getById(this.application.courseId, this.application.sessionId)
        .subscribe((session) => {
          this.session.set(session);
          this.loadingSession.set(false);

          if (session?.venueId) {
            this.venueService.getById(session.venueId).subscribe((v) => this.venue.set(v));
          }
        });
    } else {
      this.loadingSession.set(false);
    }
  }

  /** Prefills the access notes with the linked venue's address + facilities. */
  useVenueDetails(): void {
    const v = this.venue();
    if (!v) return;

    const parts = [
      `${v.name} — ${v.address ?? ''}, ${v.city}, ${v.country}`.trim(),
      v.facilities?.length ? `Facilities: ${v.facilities.join(', ')}` : '',
      v.contactPhone ? `Venue contact: ${v.contactPhone}` : '',
    ].filter(Boolean);

    this.form.patchValue({ accessNotes: parts.join('\n') });
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.error.set('');

    try {
      const v = this.form.value;
      const useSession = v.accessSource === 'session';

      await this.applicationService.setAccessDetails(this.application.id, {
        usesSessionMeetingLink: useSession,
        meetingLink: useSession ? this.session()?.meetingLink ?? null : v.customMeetingLink || null,
        accessNotes: v.accessNotes || null,
      });

      this.activeModal.close(true);
    } catch (err: any) {
      console.error('Failed to save access details:', err);
      this.error.set(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.activeModal.dismiss();
  }
}
