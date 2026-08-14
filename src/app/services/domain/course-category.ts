import { inject, Injectable, OnDestroy } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CourseCategory {
  id: string;

  name: string;

  slug: string;

  description: string;

  image: string;

  icon: string;

  color?: string;

  featured: boolean;

  displayOrder: number;

  seo: {
    title: string;
    description: string;
    keywords: string[];
  };

  isActive: boolean;

  createdAt: any;

  updatedAt: any;
}

export interface CourseCategoryDetails {
  // Extend this interface whenever you add more fields
  description?: string;

  featuredCourses?: string[];

  overview?: string;

  objectives?: string[];

  benefits?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class CourseCategoryService implements OnDestroy {
  private firestore = inject(Firestore);

  private subscription?: Subscription;

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  readonly isLoading$ = this.loadingSubject.asObservable();

  private readonly categoriesSubject = new BehaviorSubject<CourseCategory[]>([]);

  readonly categories$ = this.categoriesSubject.asObservable();

  constructor() {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loadingSubject.next(true);

    const ref = collection(this.firestore, 'course-categories');

    this.subscription = collectionData(ref, {
      idField: 'id',
    })
      .pipe(map((data) => data as CourseCategory[]))
      .subscribe({
        next: (categories) => {
          this.categoriesSubject.next(categories);

          this.loadingSubject.next(false);
        },

        error: (error) => {
          console.error('Error loading course categories:', error);

          this.loadingSubject.next(false);
        },
      });
  }

  getAll(): Observable<CourseCategory[]> {
    return this.categories$;
  }

  getCount(): Observable<number> {
    return this.categories$.pipe(
      map((categories) => categories.length),
    );
  }

  getFeatured(): Observable<CourseCategory[]> {
    return this.categories$.pipe(
      map((categories) =>
        categories.filter((category) => category.featured),
      ),
    );
  }

  getById(id: string): Observable<CourseCategory | undefined> {
    return this.categories$.pipe(
      map((categories) =>
        categories.find((category) => category.id === id),
      ),
    );
  }

  getBySlug(slug: string): Observable<CourseCategory | undefined> {
    return this.categories$.pipe(
      map((categories) =>
        categories.find((category) => category.slug === slug),
      ),
    );
  }

  getActive(): Observable<CourseCategory[]> {
    return this.categories$.pipe(
      map((categories) =>
        categories.filter((category) => category.isActive),
      ),
    );
  }

  getDetails(categoryId: string): Observable<CourseCategoryDetails> {
    const ref = doc(
      this.firestore,
      `courseCategories/${categoryId}/details/information`,
    );

    return docData(ref) as Observable<CourseCategoryDetails>;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
