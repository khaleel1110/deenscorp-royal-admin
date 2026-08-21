import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  collectionGroup,
  doc,
  docData,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

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
  /**
   * For Virtual/Online sessions. Auto-generated (Jitsi) unless the admin
   * overrides it with a real Google Meet / other link. Shared by every
   * applicant for this session — set once here, not per-application.
   */
  meetingLink?: string | null;
  createdAt?: any;
  updatedAt?: any;
}

export type CourseSessionInput = Omit<CourseSession, 'id' | 'courseId' | 'createdAt' | 'updatedAt'>;

/**
 * Generates a persistent, no-signup video room link. This is a practical
 * zero-setup default — a *real* Google Meet link (meet.google.com/xxx-xxxx-xxx)
 * requires creating a Calendar event via the Google Calendar API with a
 * service account, which is a server-side integration (see Cloud Functions
 * notes). Admins can always paste a real Meet link over this default.
 */
export function generateAutoMeetingLink(courseCode: string, sessionSeed: string): string {
  const room = `${courseCode || 'DR'}-${sessionSeed}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `https://meet.jit.si/${room}`;
}

@Injectable({
  providedIn: 'root',
})
export class CourseSessionService {
  private readonly firestore = inject(Firestore);

  /**
   * courses/{courseId}/sessions — matches the CLI seeder layout.
   */
  getByCourse(courseId: string): Observable<CourseSession[]> {
    const ref = collection(this.firestore, `courses/${courseId}/sessions`);

    return (collectionData(ref, { idField: 'id' }) as Observable<CourseSession[]>).pipe(
      map((sessions) =>
        [...sessions].sort((a, b) => {
          const aDate = a.startDate?.toDate ? a.startDate.toDate() : new Date(a.startDate);
          const bDate = b.startDate?.toDate ? b.startDate.toDate() : new Date(b.startDate);
          return aDate.getTime() - bDate.getTime();
        }),
      ),
    );
  }

  getById(courseId: string, sessionId: string): Observable<CourseSession | undefined> {
    if (!courseId || !sessionId) return of(undefined);
    const ref = doc(this.firestore, `courses/${courseId}/sessions/${sessionId}`);
    return (docData(ref, { idField: 'id' }) as Observable<CourseSession>).pipe(
      map((s) => s ?? undefined),
    );
  }

  /**
   * Every session across every course, via a Firestore collectionGroup
   * query on the 'sessions' subcollection name (used e.g. by VenueView to
   * find all sessions booked at a given venue).
   *
   * Requires no extra Firestore index for a plain read — add a composite
   * index only if you later add a `where()`/`orderBy()` on top of this.
   */
  getAll(): Observable<CourseSession[]> {
    const ref = collectionGroup(this.firestore, 'sessions');
    return collectionData(ref, { idField: 'id' }) as Observable<CourseSession[]>;
  }

  async create(courseId: string, input: CourseSessionInput): Promise<string> {
    const id = crypto.randomUUID();
    const ref = doc(this.firestore, `courses/${courseId}/sessions/${id}`);

    await setDoc(ref, {
      ...input,
      courseId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return id;
  }

  async update(
    courseId: string,
    sessionId: string,
    input: Partial<CourseSessionInput>,
  ): Promise<void> {
    const ref = doc(this.firestore, `courses/${courseId}/sessions/${sessionId}`);
    await updateDoc(ref, { ...input, updatedAt: serverTimestamp() });
  }

  async setMeetingLink(courseId: string, sessionId: string, meetingLink: string): Promise<void> {
    const ref = doc(this.firestore, `courses/${courseId}/sessions/${sessionId}`);
    await updateDoc(ref, { meetingLink, updatedAt: serverTimestamp() });
  }

  async delete(courseId: string, sessionId: string): Promise<void> {
    const ref = doc(this.firestore, `courses/${courseId}/sessions/${sessionId}`);
    await deleteDoc(ref);
  }
}
