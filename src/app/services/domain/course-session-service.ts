import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionGroup,
  collectionData,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
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
  createdAt?: any;
  updatedAt?: any;
}

export type CourseSessionInput = Omit<CourseSession, 'id' | 'courseId' | 'createdAt' | 'updatedAt'>;

@Injectable({ providedIn: 'root' })
export class CourseSessionService {
  private readonly firestore = inject(Firestore);

  private sortByStartDate(sessions: CourseSession[]): CourseSession[] {
    return [...sessions].sort((a, b) => {
      const aDate = a.startDate?.toDate ? a.startDate.toDate() : new Date(a.startDate);
      const bDate = b.startDate?.toDate ? b.startDate.toDate() : new Date(b.startDate);
      return aDate.getTime() - bDate.getTime();
    });
  }

  /**
   * courses/{courseId}/sessions — matches the CLI seeder layout.
   */
  getByCourse(courseId: string): Observable<CourseSession[]> {
    const ref = collection(this.firestore, `courses/${courseId}/sessions`);
    return (collectionData(ref, { idField: 'id' }) as Observable<CourseSession[]>).pipe(
      map((sessions) => this.sortByStartDate(sessions)),
    );
  }

  /**
   * Every session across every course — was `return this.;` (didn't compile)
   * and typed as Observable<Course[]> instead of Observable<CourseSession[]>.
   * Uses a collectionGroup query since sessions live in per-course
   * subcollections rather than one flat collection.
   */
  getAll(): Observable<CourseSession[]> {
    const ref = collectionGroup(this.firestore, 'sessions');
    return (collectionData(ref, { idField: 'id' }) as Observable<CourseSession[]>).pipe(
      map((sessions) => this.sortByStartDate(sessions)),
    );
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

  async delete(courseId: string, sessionId: string): Promise<void> {
    const ref = doc(this.firestore, `courses/${courseId}/sessions/${sessionId}`);
    await deleteDoc(ref);
  }
}
