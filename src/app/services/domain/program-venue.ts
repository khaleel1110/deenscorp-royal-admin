import { inject, Injectable, OnDestroy } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TrainingVenue {
  id: string;

  name: string;

  city: string;

  state: string;

  country: string;

  address: string;

  postcode: string;

  latitude: number;

  longitude: number;

  timezone: string;

  contactEmail: string;

  contactPhone: string;

  website: string;

  image: string;

  facilities: string[];

  isActive: boolean;

  createdAt: any;

  updatedAt: any;
}

@Injectable({
  providedIn: 'root',
})
export class TrainingVenueService implements OnDestroy {
  private firestore = inject(Firestore);

  private subscription?: Subscription;

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  readonly isLoading$ = this.loadingSubject.asObservable();

  private readonly venuesSubject = new BehaviorSubject<TrainingVenue[]>([]);

  readonly venues$ = this.venuesSubject.asObservable();

  constructor() {
    this.loadVenues();
  }

  private loadVenues(): void {
    this.loadingSubject.next(true);

    const ref = collection(this.firestore, 'training-venues');

    this.subscription = collectionData(ref, {
      idField: 'id',
    })
      .pipe(
        map((data) =>
          (data as TrainingVenue[])
            .filter((venue) => venue.isActive)
            .sort((a, b) => a.name.localeCompare(b.name)),
        ),
      )
      .subscribe({
        next: (venues) => {
          this.venuesSubject.next(venues);

          this.loadingSubject.next(false);
        },

        error: (error) => {
          console.error('Error loading training venues:', error);

          this.loadingSubject.next(false);
        },
      });
  }

  getAll(): Observable<TrainingVenue[]> {
    return this.venues$;
  }

  getCount(): Observable<number> {
    return this.venues$.pipe(map((venues) => venues.length));
  }

  getActive(): Observable<TrainingVenue[]> {
    return this.venues$.pipe(map((venues) => venues.filter((venue) => venue.isActive)));
  }

  getById(id: string): Observable<TrainingVenue | undefined> {
    return this.venues$.pipe(map((venues) => venues.find((venue) => venue.id === id)));
  }

  getByCountry(country: string): Observable<TrainingVenue[]> {
    const value = country.toLowerCase();

    return this.venues$.pipe(
      map((venues) => venues.filter((venue) => venue.country.toLowerCase() === value)),
    );
  }

  getByCity(city: string): Observable<TrainingVenue[]> {
    const value = city.toLowerCase();

    return this.venues$.pipe(
      map((venues) => venues.filter((venue) => venue.city.toLowerCase() === value)),
    );
  }

  getFeatured(limit = 6): Observable<TrainingVenue[]> {
    return this.venues$.pipe(map((venues) => venues.slice(0, limit)));
  }

  search(keyword: string): Observable<TrainingVenue[]> {
    const search = keyword.trim().toLowerCase();

    return this.venues$.pipe(
      map((venues) =>
        venues.filter(
          (venue) =>
            venue.name.toLowerCase().includes(search) ||
            venue.city.toLowerCase().includes(search) ||
            venue.state.toLowerCase().includes(search) ||
            venue.country.toLowerCase().includes(search) ||
            venue.address.toLowerCase().includes(search) ||
            venue.facilities.some((facility) => facility.toLowerCase().includes(search)),
        ),
      ),
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
