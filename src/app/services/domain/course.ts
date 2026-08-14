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

export interface Course {
  id: string;

  categoryId: string;

  code: string;

  name: string;

  slug: string;

  shortDescription: string;

  duration: string;

  language: string;

  level: 'Beginner' | 'Intermediate' | 'Advanced';

  deliveryModes: ('Classroom' | 'Online' | 'Virtual' | 'Onsite')[];

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
export interface CourseTopic {
  id: string;

  title: string;

  description: string;

  duration: string;
  learningPoints: string[];


  order: number;

  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;

  title: string;

  duration: string;

  type: string;

  order: number;
}

export interface CourseDetails {
  overview: string;

  objectives: string[];

  outcomes: string[];

  whoShouldAttend: string[];

  prerequisites: string[];
}

@Injectable({
  providedIn: 'root',
})
export class CourseService implements OnDestroy {
  private readonly firestore = inject(Firestore);

  private subscription?: Subscription;

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  readonly isLoading$ = this.loadingSubject.asObservable();

  private readonly coursesSubject = new BehaviorSubject<Course[]>([]);

  readonly courses$ = this.coursesSubject.asObservable();

  constructor() {
    this.loadCourses();
  }

  /**
   * Loads all course metadata.
   * Detailed information is stored separately under:
   * courses/{courseId}/details/information
   */
  private loadCourses(): void {
    this.loadingSubject.next(true);

    const ref = collection(this.firestore, 'courses');

    this.subscription = collectionData(ref, {
      idField: 'id',
    })
      .pipe(map((courses) => courses as Course[]))
      .subscribe({
        next: (courses) => {
          this.coursesSubject.next(courses);

          this.loadingSubject.next(false);
        },

        error: (error) => {
          console.error('Error loading courses:', error);

          this.loadingSubject.next(false);
        },
      });
  }

  /**
   * Returns all courses.
   */
  getAll(): Observable<Course[]> {
    return this.courses$;
  }

  /**
   * Returns total number of courses.
   */
  getCount(): Observable<number> {
    return this.courses$.pipe(map((courses) => courses.length));
  }

  /**
   * Returns featured courses.
   */
  getFeatured(): Observable<Course[]> {
    return this.courses$.pipe(map((courses) => courses.filter((course) => course.featured)));
  }

  /**
   * Returns a course by Firestore ID.
   */
  getById(id: string): Observable<Course | undefined> {
    return this.courses$.pipe(map((courses) => courses.find((course) => course.id === id)));
  }

  /**
   * Returns a course by slug.
   */
  getBySlug(slug: string): Observable<Course | undefined> {
    return this.courses$.pipe(map((courses) => courses.find((course) => course.slug === slug)));
  }

  /**
   * Returns all courses in a category.
   */
  getByCategory(categoryId: string): Observable<Course[]> {
    return this.courses$.pipe(
      map((courses) => courses.filter((course) => course.categoryId === categoryId)),
    );
  }

  /**
   * Loads detailed course information.
   *
   * Firestore Path:
   * courses/{courseId}/details/information
   */

  /**
   * Loads one course.
   */
  getCourse(courseId: string): Observable<Course | undefined> {
    return this.getById(courseId);
  }

  /**
   * Loads overview document.
   */
  getDetails(courseId: string): Observable<CourseDetails> {
    const ref = doc(this.firestore, `courses/${courseId}/details/information`);

    return docData(ref) as Observable<CourseDetails>;
  }

  /**
   * Loads all course topics.
   *
   * courses/{courseId}/topics
   */
  getTopics(courseId: string): Observable<CourseTopic[]> {
    const ref = collection(this.firestore, `courses/${courseId}/topics`);

    return collectionData(ref, {
      idField: 'id',
    }) as Observable<CourseTopic[]>;
  }

  /**
   * Loads lessons of one topic.
   *
   * courses/{courseId}/topics/{topicId}/lessons
   */
  getLessons(courseId: string, topicId: string): Observable<CourseLesson[]> {
    const ref = collection(this.firestore, `courses/${courseId}/topics/${topicId}/lessons`);

    return collectionData(ref, {
      idField: 'id',
    }) as Observable<CourseLesson[]>;
  }

  /**
   * Performs a client-side search.
   */
  search(keyword: string): Observable<Course[]> {
    const searchTerm = keyword.trim().toLowerCase();

    return this.courses$.pipe(
      map((courses) =>
        courses.filter(
          (course) =>
            course.name.toLowerCase().includes(searchTerm) ||
            course.shortDescription.toLowerCase().includes(searchTerm) ||
            course.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
        ),
      ),
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
