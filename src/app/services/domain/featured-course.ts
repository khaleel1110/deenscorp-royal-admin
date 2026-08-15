import { inject, Injectable, OnDestroy } from '@angular/core';
import {
  Firestore, collection, collectionData, doc,
  addDoc, updateDoc, deleteDoc, serverTimestamp,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

export interface FeaturedCourse {
  id: string;
  title: string;
  category: string;
  badge: string;
  badgeColor: string;
  image: string;
  rating: number;
  reviewCount: number;
  lessons: number;
  duration: string;
  originalPrice: number;
  currentPrice: number;
  currency: string;
  previewUrl: string;
  /** Optional link back to a real Course document, for convenience prefill. */
  courseId?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export type FeaturedCourseFormInput = Omit<FeaturedCourse, 'id' | 'createdAt' | 'updatedAt'>;

@Injectable({ providedIn: 'root' })
export class FeaturedCourseService implements OnDestroy {
  private firestore = inject(Firestore);
  private subscription?: Subscription;

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  readonly isLoading$ = this.loadingSubject.asObservable();

  // Raw, unfiltered — used by admin screens (list/edit/dashboard).
  private readonly allItemsSubject = new BehaviorSubject<FeaturedCourse[]>([]);
  readonly allFeaturedCourses$ = this.allItemsSubject.asObservable();

  // Public-facing — active only, sorted for display. Used by the home page.
  readonly featuredCourses$ = this.allItemsSubject.pipe(
    map((items) =>
      items
        .filter((item) => item.isActive)
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    ),
  );

  constructor() {
    this.load();
  }

  private load(): void {
    this.loadingSubject.next(true);

    const ref = collection(this.firestore, 'featured-courses');

    this.subscription = collectionData(ref, { idField: 'id' })
      .pipe(
        map((data) =>
          (data as FeaturedCourse[]).sort(
            (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
          ),
        ),
      )
      .subscribe({
        next: (items) => {
          this.allItemsSubject.next(items);
          this.loadingSubject.next(false);
        },
        error: (error) => {
          console.error('Error loading featured courses:', error);
          this.loadingSubject.next(false);
        },
      });
  }

  // ── Reads ──────────────────────────────────────────────────
  getAll(): Observable<FeaturedCourse[]> {
    return this.featuredCourses$;
  }

  getAllIncludingInactive(): Observable<FeaturedCourse[]> {
    return this.allFeaturedCourses$;
  }

  getById(id: string): Observable<FeaturedCourse | undefined> {
    return this.allFeaturedCourses$.pipe(map((items) => items.find((i) => i.id === id)));
  }

  getCount(): Observable<number> {
    return this.featuredCourses$.pipe(map((items) => items.length));
  }

  // ── Writes ─────────────────────────────────────────────────
  async create(input: FeaturedCourseFormInput): Promise<string> {
    const ref = collection(this.firestore, 'featured-courses');
    const docRef = await addDoc(ref, {
      ...input,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async update(id: string, input: FeaturedCourseFormInput): Promise<void> {
    const itemRef = doc(this.firestore, `featured-courses/${id}`);
    await updateDoc(itemRef, {
      ...input,
      updatedAt: serverTimestamp(),
    });
  }

  async setActive(id: string, isActive: boolean): Promise<void> {
    const itemRef = doc(this.firestore, `featured-courses/${id}`);
    await updateDoc(itemRef, { isActive, updatedAt: serverTimestamp() });
  }

  async delete(id: string): Promise<void> {
    const itemRef = doc(this.firestore, `featured-courses/${id}`);
    await deleteDoc(itemRef);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
