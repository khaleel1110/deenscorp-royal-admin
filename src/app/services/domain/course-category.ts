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
  description?: string;
  featuredCourses?: string[];
  overview?: string;
  objectives?: string[];
  benefits?: string[];
}

/** Fields the Add/Edit Category modal actually collects from the user. */
export type CourseCategoryInput = Pick<
  CourseCategory,
  'name' | 'description' | 'icon' | 'color' | 'featured' | 'displayOrder' | 'isActive'
> & {
  image?: string;
  seo?: Partial<CourseCategory['seo']>;
};

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

    this.subscription = collectionData(ref, { idField: 'id' })
      .pipe(map((data) => data as CourseCategory[]))
      .subscribe({
        next: (categories) => {
          this.categoriesSubject.next(
            [...categories].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
          );
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
    return this.categories$.pipe(map((categories) => categories.length));
  }

  getFeatured(): Observable<CourseCategory[]> {
    return this.categories$.pipe(map((categories) => categories.filter((c) => c.featured)));
  }

  getById(id: string): Observable<CourseCategory | undefined> {
    return this.categories$.pipe(map((categories) => categories.find((c) => c.id === id)));
  }

  getBySlug(slug: string): Observable<CourseCategory | undefined> {
    return this.categories$.pipe(map((categories) => categories.find((c) => c.slug === slug)));
  }

  getActive(): Observable<CourseCategory[]> {
    return this.categories$.pipe(map((categories) => categories.filter((c) => c.isActive)));
  }

  getDetails(categoryId: string): Observable<CourseCategoryDetails> {
    const ref = doc(this.firestore, `course-categories/${categoryId}/details/information`);
    return docData(ref) as Observable<CourseCategoryDetails>;
  }

  /** Creates a new category. Returns the generated id (slugified name). */
  async create(input: CourseCategoryInput): Promise<string> {
    const id = slugify(input.name) || crypto.randomUUID();
    const ref = doc(this.firestore, `course-categories/${id}`);

    await setDoc(ref, {
      name: input.name,
      slug: slugify(input.name),
      description: input.description ?? '',
      image: input.image ?? '',
      icon: input.icon ?? '',
      color: input.color ?? '',
      featured: input.featured ?? false,
      displayOrder: input.displayOrder ?? 0,
      seo: {
        title: input.seo?.title ?? input.name,
        description: input.seo?.description ?? input.description ?? '',
        keywords: input.seo?.keywords ?? [],
      },
      isActive: input.isActive ?? true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return id;
  }

  /** Updates an existing category by id. */
  async update(id: string, input: Partial<CourseCategoryInput>): Promise<void> {
    const ref = doc(this.firestore, `course-categories/${id}`);

    const payload: Record<string, any> = {
      ...input,
      updatedAt: serverTimestamp(),
    };

    if (input.name) {
      payload['slug'] = slugify(input.name);
    }

    await updateDoc(ref, payload);
  }

  async delete(id: string): Promise<void> {
    const ref = doc(this.firestore, `course-categories/${id}`);
    await deleteDoc(ref);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
