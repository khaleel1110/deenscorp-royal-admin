import { inject, Injectable, OnDestroy } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
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
  details?: CourseDetails; // optional – stored in subcollection
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

/** Everything the Add/Edit Course modal collects, minus generated/system fields. */
export interface CourseFormInput {
  categoryId: string;
  code: string;
  name: string;
  shortDescription: string;
  duration: string;
  language: string;
  level: Course['level'];
  deliveryModes: Course['deliveryModes'];
  certificate: boolean;
  accreditation: string;
  brochureUrl: string;
  thumbnail: string;
  banner: string;
  gallery: string[];
  tags: string[];
  industries: string[];
  featured: boolean;
  isActive: boolean;
  seo?: Partial<Course['seo']>;
  details: CourseDetails;
  topics: Omit<CourseTopic, 'id'>[];
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
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

  private loadCourses(): void {
    this.loadingSubject.next(true);

    const ref = collection(this.firestore, 'courses');

    this.subscription = collectionData(ref, { idField: 'id' })
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

  getAll(): Observable<Course[]> {
    return this.courses$;
  }

  getCount(): Observable<number> {
    return this.courses$.pipe(map((courses) => courses.length));
  }

  getFeatured(): Observable<Course[]> {
    return this.courses$.pipe(map((courses) => courses.filter((c) => c.featured)));
  }

  getById(id: string): Observable<Course | undefined> {
    return this.courses$.pipe(map((courses) => courses.find((c) => c.id === id)));
  }

  getBySlug(slug: string): Observable<Course | undefined> {
    return this.courses$.pipe(map((courses) => courses.find((c) => c.slug === slug)));
  }

  getByCategory(categoryId: string): Observable<Course[]> {
    return this.courses$.pipe(map((courses) => courses.filter((c) => c.categoryId === categoryId)));
  }

  getCourse(courseId: string): Observable<Course | undefined> {
    return this.getById(courseId);
  }

  getDetails(courseId: string): Observable<CourseDetails> {
    const ref = doc(this.firestore, `courses/${courseId}/details/information`);
    return docData(ref) as Observable<CourseDetails>;
  }

  getTopics(courseId: string): Observable<CourseTopic[]> {
    const ref = collection(this.firestore, `courses/${courseId}/topics`);
    return (collectionData(ref, { idField: 'id' }) as Observable<CourseTopic[]>).pipe(
      map((topics) => [...topics].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))),
    );
  }

  getLessons(courseId: string, topicId: string): Observable<CourseLesson[]> {
    const ref = collection(this.firestore, `courses/${courseId}/topics/${topicId}/lessons`);
    return collectionData(ref, { idField: 'id' }) as Observable<CourseLesson[]>;
  }

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

  /**
   * Creates a course the same way the CLI seeder does:
   *  - courses/{id}                       -> course metadata
   *  - courses/{id}/details/information    -> overview/objectives/etc.
   *  - courses/{id}/topics/{topicId}       -> each topic
   *
   * Sessions are created separately via CourseSessionService, since
   * they belong to a venue chosen in a later step of the form.
   */
  async create(input: CourseFormInput): Promise<string> {
    const id = slugify(input.name) || crypto.randomUUID();
    const slug = slugify(input.name);

    const courseRef = doc(this.firestore, `courses/${id}`);

    const courseData: Omit<Course, 'id'> = {
      categoryId: input.categoryId,
      code: input.code,
      name: input.name,
      slug,
      shortDescription: input.shortDescription,
      duration: input.duration,
      language: input.language,
      level: input.level,
      deliveryModes: input.deliveryModes,
      certificate: input.certificate,
      accreditation: input.accreditation,
      brochureUrl: input.brochureUrl,
      thumbnail: input.thumbnail,
      banner: input.banner,
      gallery: input.gallery ?? [],
      tags: input.tags ?? [],
      industries: input.industries ?? [],
      featured: input.featured,
      rating: 0,
      reviewCount: 0,
      isActive: input.isActive,
      seo: {
        title: input.seo?.title ?? input.name,
        description: input.seo?.description ?? input.shortDescription,
        keywords: input.seo?.keywords ?? [],
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(courseRef, courseData);

    const detailsRef = doc(this.firestore, `courses/${id}/details/information`);
    await setDoc(detailsRef, input.details);

    for (let i = 0; i < input.topics.length; i++) {
      const topic = input.topics[i];
      const topicId = crypto.randomUUID();
      const topicRef = doc(this.firestore, `courses/${id}/topics/${topicId}`);

      await setDoc(topicRef, {
        ...topic,
        order: topic.order ?? i + 1,
        lessons: topic.lessons ?? [],
      });
    }

    return id;
  }

  /**
   * Updates course metadata, details, and replaces the topics
   * subcollection with the ones currently in the form.
   */
  async update(id: string, input: CourseFormInput): Promise<void> {
    const slug = slugify(input.name);

    const courseRef = doc(this.firestore, `courses/${id}`);

    await updateDoc(courseRef, {
      categoryId: input.categoryId,
      code: input.code,
      name: input.name,
      slug,
      shortDescription: input.shortDescription,
      duration: input.duration,
      language: input.language,
      level: input.level,
      deliveryModes: input.deliveryModes,
      certificate: input.certificate,
      accreditation: input.accreditation,
      brochureUrl: input.brochureUrl,
      thumbnail: input.thumbnail,
      banner: input.banner,
      gallery: input.gallery ?? [],
      tags: input.tags ?? [],
      industries: input.industries ?? [],
      featured: input.featured,
      isActive: input.isActive,
      seo: {
        title: input.seo?.title ?? input.name,
        description: input.seo?.description ?? input.shortDescription,
        keywords: input.seo?.keywords ?? [],
      },
      updatedAt: serverTimestamp(),
    });

    const detailsRef = doc(this.firestore, `courses/${id}/details/information`);
    await setDoc(detailsRef, input.details, { merge: false });

    // Replace topics: clear existing ones, then re-write.
    const existingTopics = await new Promise<CourseTopic[]>((resolve) => {
      this.getTopics(id).subscribe((topics) => resolve(topics));
    });

    for (const topic of existingTopics) {
      const topicRef = doc(this.firestore, `courses/${id}/topics/${topic.id}`);
      await deleteDoc(topicRef);
    }

    for (let i = 0; i < input.topics.length; i++) {
      const topic = input.topics[i];
      const topicId = crypto.randomUUID();
      const topicRef = doc(this.firestore, `courses/${id}/topics/${topicId}`);

      await setDoc(topicRef, {
        ...topic,
        order: topic.order ?? i + 1,
        lessons: topic.lessons ?? [],
      });
    }
  }

  async delete(id: string): Promise<void> {
    const courseRef = doc(this.firestore, `courses/${id}`);
    await deleteDoc(courseRef);
    // Note: subcollections (details/topics/sessions) are NOT auto-deleted
    // by Firestore. For production, clean these up via a Cloud Function
    // (onDocumentDeleted trigger) rather than client-side recursion.
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
