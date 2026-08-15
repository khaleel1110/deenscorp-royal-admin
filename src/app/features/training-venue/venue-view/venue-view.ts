import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { TrainingVenueModal } from '../training-venue-modal/training-venue-modal';
import { TrainingVenueService } from '../../../services/domain/program-venue';
import {
  CourseSession,
  CourseSessionService,
} from '../../../services/domain/course-session-service';
import { Course, CourseService } from '../../../services/domain/course';

@Component({
  selector: 'app-venue-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './venue-view.html',
  styleUrl: './venue-view.scss',
})
export class VenueView {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly venueService = inject(TrainingVenueService);
  private readonly sessionService = inject(CourseSessionService);
  private readonly courseService = inject(CourseService);
  private readonly modalService = inject(NgbModal);

  readonly venueId = toSignal(this.route.paramMap.pipe(map((p) => p.get('id'))), {
    initialValue: null,
  });

  readonly venue = toSignal(
    toObservable(this.venueId).pipe(
      switchMap((id) => (id ? this.venueService.getById(id) : of(undefined))),
    ),
    { initialValue: undefined },
  );

  // was `initialValue: []` with no generic — inferred as never[], which
  // silently broke the .filter() below under strict mode.
  readonly allSessions = toSignal(this.sessionService.getAll(), {
    initialValue: [] as CourseSession[],
  });

  readonly courses = toSignal(this.courseService.getAll(), { initialValue: [] as Course[] });

  readonly sessionsAtVenue = computed(() =>
    this.allSessions().filter((s) => s.venueId === this.venueId()),
  );

  courseName(courseId: string): string {
    return this.courses().find((c) => c.id === courseId)?.name ?? 'Unknown Course';
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  mapUrl(): string | null {
    const v = this.venue();
    if (!v?.latitude || !v?.longitude) return null;
    return `https://www.google.com/maps?q=${v.latitude},${v.longitude}`;
  }

  readonly loading = computed(() => !this.venue());

  openEditModal(): void {
    const venue = this.venue();
    if (!venue) return;
    const ref = this.modalService.open(TrainingVenueModal, { size: 'lg', backdrop: 'static' });
    ref.componentInstance.venue = venue;
  }

  async deleteVenue(): Promise<void> {
    const venue = this.venue();
    if (!venue) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete "${venue.name}"?\n\nThis action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await this.venueService.delete(venue.id);
      this.router.navigate(['/admin/venues']);
    } catch (error) {
      console.error('Failed to delete venue:', error);
      alert('Failed to delete the venue. Please try again.');
    }
  }
}
