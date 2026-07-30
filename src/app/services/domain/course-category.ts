import { Injectable, inject } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
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



@Injectable({
  providedIn: 'root',
})
export class CourseCategory {

  constructor() {
    const firestore = inject(Firestore);

    console.log(firestore);
  }

  /*private subscription?: Subscription;

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  readonly isLoading$ = this.loadingSubject.asObservable();

  private readonly categoriesSubject = new BehaviorSubject<CourseCategory[]>([]);

  readonly categories$ = this.categoriesSubject.asObservable();

  constructor() {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loadingSubject.next(true);

    const ref = collection(this.firestore, 'courseCategories');

    console.log('Collection reference:', ref.path);

    this.subscription = collectionData(ref, {
      idField: 'id',
    }).subscribe({
      next: (categories) => {
        console.log('Firestore returned:', categories);

        this.categoriesSubject.next(categories as CourseCategory[]);

        this.loadingSubject.next(false);
      },

      error: (error) => {
        console.error('Firestore Error:', error);

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
    return this.categories$.pipe(
      map((categories) => categories.filter((category) => category.featured)),
    );
  }

  getById(id: string): Observable<CourseCategory | undefined> {
    return this.categories$.pipe(
      map((categories) => categories.find((category) => category.id === id)),
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }*/
}
