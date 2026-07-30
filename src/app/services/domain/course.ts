import { inject, Injectable, OnDestroy } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Course {
  id: string;

  categoryId: string;

  code: string;

  name: string;

  slug: string;

  shortDescription: string;

  overview: string;

  objectives: string[];

  outcomes: string[];

  whoShouldAttend: string[];

  prerequisites: string[];

  duration: string;

  language: string;

  level: string;

  deliveryModes: string[];

  certificate: boolean;

  accreditation: string;

  brochureUrl: string;

  thumbnail: string;

  banner: string;

  gallery: string[];

  tags: string[];

  industries: string[];

  featured: boolean;

  rating: number;

  reviewCount: number;

  isActive: boolean;

  seo: {
    title: string;

    description: string;

    keywords: string[];
  };

  createdAt: any;

  updatedAt: any;
}

@Injectable({
  providedIn: 'root',
})
export class CourseService implements OnDestroy {
  private firestore = inject(Firestore);

  private subscription?: Subscription;

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  readonly isLoading$ = this.loadingSubject.asObservable();

  private readonly coursesSubject = new BehaviorSubject<Course[]>([]);

  readonly courses$ = this.coursesSubject.asObservable();

  constructor() {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loadingSubject.next(true);

    const ref = collection(this.firestore, 'courses');

    this.subscription = collectionData(ref, {
      idField: 'id',
    })
      .pipe(map((data) => data as Course[]))
      .subscribe({
        next: (courses) => {
          this.coursesSubject.next(courses);

          this.loadingSubject.next(false);
        },

        error: (error) => {
          console.error(error);

          this.loadingSubject.next(false);
        },
      });
  }

  getAll(): Observable<Course[]> {
    return this.courses$;
  }

  getCount(): Observable<number> {
    return this.courses$.pipe(map((courses) => courses.length));
  }

  getFeatured(): Observable<Course[]> {
    return this.courses$.pipe(map((courses) => courses.filter((course) => course.featured)));
  }

  getById(id: string): Observable<Course | undefined> {
    return this.courses$.pipe(map((courses) => courses.find((course) => course.id === id)));
  }

  getByCategory(categoryId: string): Observable<Course[]> {
    return this.courses$.pipe(
      map((courses) => courses.filter((course) => course.categoryId === categoryId)),
    );
  }

  search(search: string): Observable<Course[]> {
    const keyword = search.toLowerCase();

    return this.courses$.pipe(
      map((courses) =>
        courses.filter(
          (course) =>
            course.name.toLowerCase().includes(keyword) ||
            course.shortDescription.toLowerCase().includes(keyword) ||
            course.tags.some((tag) => tag.toLowerCase().includes(keyword)),
        ),
      ),
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
