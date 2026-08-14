import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  collectionGroup,
  doc,
  docData,
  query,
  where,
} from '@angular/fire/firestore';
import { map, Observable, switchMap } from 'rxjs';

export interface CourseSession {
  id: string;
  courseId: string;
  venueId: string;

  startDate: any;
  endDate: any;
  registrationDeadline: any;

  duration: string;

  price: number;
  currency: string;

  availableSeats: number;
  totalSeats: number;

  instructor: string;

  deliveryMode: 'Classroom' | 'Virtual' | 'Online' | 'Onsite';

  status: 'Upcoming' | 'Open' | 'Few Seats' | 'Full' | 'Completed' | 'Cancelled';

  notes: string;

  isFeatured: boolean;

  createdAt: any;
  updatedAt: any;
}

@Injectable({
  providedIn: 'root',
})
export class CourseSessionService {
  private firestore = inject(Firestore);

  getAll(): Observable<CourseSession[]> {
    return collectionData(collectionGroup(this.firestore, 'sessions'), {
      idField: 'id',
    }) as Observable<CourseSession[]>;
  }

  getByCourse(courseId: string): Observable<CourseSession[]> {
    return collectionData(collection(this.firestore, `courses/${courseId}/sessions`), {
      idField: 'id',
    }) as Observable<CourseSession[]>;
  }

  getFeaturedByCourse(courseId: string): Observable<CourseSession[]> {
    return this.getByCourse(courseId).pipe(map((x) => x.filter((s) => s.isFeatured)));
  }

  /**
   * Returns a single session by id.
   */
  getById(sessionId: string): Observable<CourseSession | undefined> {
    return this.getAll().pipe(map((sessions) => sessions.find((s) => s.id === sessionId)));
  }

  /**
   * Loads the course owning this session.
   */
  getCourseId(sessionId: string): Observable<string | undefined> {
    return this.getById(sessionId).pipe(map((session) => session?.courseId));
  }

  /**
   * All scheduled dates of this course.
   */
  getRelatedSessions(sessionId: string): Observable<CourseSession[]> {
    return this.getById(sessionId).pipe(
      switchMap((session) => {
        if (!session) return [];
        return this.getByCourse(session.courseId);
      }),
    );
  }
}
