import { inject, Injectable, OnDestroy } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData, addDoc,
} from '@angular/fire/firestore';

import {
  BehaviorSubject,
  Observable,
  Subscription,
  map,
} from 'rxjs';
import { JobApplication } from '../features/company/career-overview/career-overview';

export interface Job {
  id: string;
  slug: string;

  title: string;
  department: string;
  location: string;

  employmentType:
    | 'Full-Time'
    | 'Part-Time'
    | 'Contract'
    | 'Remote'
    | 'Internship';

  shortDescription: string;

  featured: boolean;
  remote: boolean;
  active: boolean;

  applyUrl: string;

  createdAt: any;
  updatedAt: any;
}

export interface CareerDetail {

  overview: string[];

  responsibilities: string[];

  requirements: string[];

  qualifications: string[];

  benefits: string[];

  technologies: string[];

  hiringProcess: string[];

  niceToHave: string[];

  closingRemark: string;

  applicationForm: {
    resume: boolean;

    personalInfo: {
      fullName: boolean;
      email: boolean;
      phone: boolean;
      currentCompany: boolean;
    };

    links: {
      linkedIn: boolean;
      twitter: boolean;
      github: boolean;
      portfolio: boolean;
      website: boolean;
    };

    questions: {
      desiredSalary: boolean;
      availableStartDate: boolean;
      coverLetter: boolean;
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class CareerService implements OnDestroy {

  private firestore = inject(Firestore);

  private subscription?: Subscription;

  private readonly loadingSubject =
    new BehaviorSubject(false);

  readonly isLoading$ =
    this.loadingSubject.asObservable();

  private readonly careersSubject =
    new BehaviorSubject<Job[]>([]);

  readonly careers$ =
    this.careersSubject.asObservable();

  constructor() {
    this.loadCareers();
  }

  loadCareers() {

    this.loadingSubject.next(true);

    const ref = collection(this.firestore, 'careers');

    this.subscription = collectionData(ref, {
      idField: 'id',
    })
      .pipe(map(data => data as Job[]))
      .subscribe({

        next: careers => {

          this.careersSubject.next(careers);

          this.loadingSubject.next(false);

        },

        error: error => {

          console.error(error);

          this.loadingSubject.next(false);

        }

      });

  }

  getAll(): Observable<Job[]> {
    return this.careers$;
  }

  getFeatured(): Observable<Job[]> {
    return this.careers$.pipe(
      map(x => x.filter(c => c.featured))
    );
  }

  getCount(): Observable<number> {
    return this.careers$.pipe(
      map(x => x.length)
    );
  }

  getById(id: string): Observable<Job | undefined> {
    return this.careers$.pipe(
      map(x => x.find(c => c.id === id))
    );
  }

  getCareerDetails(id: string): Observable<CareerDetail> {

    const ref = doc(
      this.firestore,
      `careers/${id}/details/information`
    );

    return docData(ref) as Observable<CareerDetail>;

  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  submitApplication(
    careerId: string,
    application: JobApplication
  ) {

    const ref = collection(
      this.firestore,
      `careers/${careerId}/applications`
    );

    return addDoc(ref, application);


  }
}
