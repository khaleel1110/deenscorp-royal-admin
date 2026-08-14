import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, of, map } from 'rxjs';
import { NgbModal, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { CourseService, CourseDetails, CourseTopic } from '../../../services/domain/course';
import { CourseSessionService, CourseSession } from '../../../services/domain/course-session-service';
import { TrainingVenueService, TrainingVenue } from '../../../services/domain/program-venue';
import { CourseCategoryService, CourseCategory } from '../../../services/domain/course-category';
import { CourseModal } from '../course-list/course-modal';

@Component({
  selector: 'app-view-course',
  standalone: true,
  imports: [CommonModule, RouterLink, NgbDropdownModule],
  templateUrl: './view-course.html',
  styleUrls: ['./view-course.scss'],
})
export class ViewCourse {
  // --------------------------------------------------------------
  // Services
  // --------------------------------------------------------------
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly modalService = inject(NgbModal);
  private readonly courseService = inject(CourseService);
  private readonly sessionService = inject(CourseSessionService);
  private readonly venueService = inject(TrainingVenueService);
  private readonly categoryService = inject(CourseCategoryService);

  // --------------------------------------------------------------
  // Route Param
  // --------------------------------------------------------------
  readonly courseId = toSignal(
    this.route.paramMap.pipe(map(params => params.get('id'))),
    { initialValue: null }
  );

  // --------------------------------------------------------------
  // Data Streams
  // --------------------------------------------------------------
  readonly course = toSignal(
    toObservable(this.courseId).pipe(
      switchMap(id => id ? this.courseService.getById(id) : of(undefined))
    ),
    { initialValue: undefined }
  );

  readonly details = toSignal(
    toObservable(this.courseId).pipe(
      switchMap(id => id ? this.courseService.getDetails(id) : of(undefined))
    ),
    { initialValue: undefined }
  );

  readonly topics = toSignal(
    toObservable(this.courseId).pipe(
      switchMap(id => id ? this.courseService.getTopics(id) : of([]))
    ),
    { initialValue: [] as CourseTopic[] }
  );

  readonly sessions = toSignal(
    toObservable(this.courseId).pipe(
      switchMap(id => id ? this.sessionService.getByCourse(id) : of([]))
    ),
    { initialValue: [] as CourseSession[] }
  );

  readonly categories = toSignal(
    this.categoryService.categories$,
    { initialValue: [] as CourseCategory[] }
  );

  readonly venues = toSignal(
    this.venueService.venues$,
    { initialValue: [] as TrainingVenue[] }
  );

  // --------------------------------------------------------------
  // Computed Helpers
  // --------------------------------------------------------------
  readonly categoryName = computed(() => {
    const catId = this.course()?.categoryId;
    return this.categories().find(c => c.id === catId)?.name ?? '—';
  });

  readonly venueName = (venueId: string) => {
    return this.venues().find(v => v.id === venueId)?.name ?? 'Unknown Venue';
  };

  readonly formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  /** Used by the sidebar session "tickets": splits a date into day + short month. */
  readonly dateParts = (date: any): { day: string; month: string } => {
    if (!date) return { day: '—', month: '' };
    const d = date.toDate ? date.toDate() : new Date(date);
    return {
      day: d.toLocaleDateString('en-US', { day: '2-digit' }),
      month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    };
  };

  /** Percentage of seats already taken, used for the ticket's seat-fill bar. */
  seatsFillPercent(session: CourseSession): number {
    if (!session.totalSeats) return 0;
    const taken = session.totalSeats - session.availableSeats;
    return Math.max(0, Math.min(100, Math.round((taken / session.totalSeats) * 100)));
  }

  /** Sessions that haven't happened/been cancelled yet, soonest first. */
  readonly upcomingSessions = computed(() => {
    const list = this.sessions().filter(
      (s) => s.status !== 'Completed' && s.status !== 'Cancelled',
    );

    return [...list].sort((a, b) => {
      const aDate = (a.startDate as any)?.toDate ? (a.startDate as any).toDate() : new Date(a.startDate as any);
      const bDate = (b.startDate as any)?.toDate ? (b.startDate as any).toDate() : new Date(b.startDate as any);
      return aDate.getTime() - bDate.getTime();
    });
  });

  readonly nextSession = computed(() => this.upcomingSessions()[0]);

  readonly totalAvailableSeats = computed(() =>
    this.sessions().reduce((sum, s) => sum + (s.availableSeats || 0), 0),
  );

  // --------------------------------------------------------------
  // Edit & Delete Actions
  // --------------------------------------------------------------
  openEditModal(): void {
    const course = this.course();
    if (!course) return;

    const modalRef = this.modalService.open(CourseModal, {
      size: 'lg',
      backdrop: 'static',
    });
    modalRef.componentInstance.course = course;

    modalRef.result.then((updated) => {
      if (updated) {
        // Reload data or just refresh the view – the signal will update automatically
        // since the service's BehaviorSubject is updated.
      }
    }).catch(() => {});
  }

  async deleteCourse(): Promise<void> {
    const course = this.course();
    if (!course) return;

    const confirmDelete = window.confirm(`Are you sure you want to delete “${course.name}”?`);
    if (!confirmDelete) return;

    try {
      await this.courseService.delete(course.id);
      // Navigate back to the list
      this.router.navigate(['/course-list']);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete the course. Please try again.');
    }
  }

  // --------------------------------------------------------------
  // Loading State
  // --------------------------------------------------------------
  readonly loading = computed(() => !this.course() || !this.details());
}
