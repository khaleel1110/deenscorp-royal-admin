import { inject, Injectable, OnDestroy } from '@angular/core';
import {
  Firestore, collection, collectionData, doc,
  addDoc, updateDoc, deleteDoc, serverTimestamp,
} from '@angular/fire/firestore';
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

export type VenueFormInput = Omit<TrainingVenue, 'id' | 'createdAt' | 'updatedAt'>;

@Injectable({ providedIn: 'root' })
export class TrainingVenueService implements OnDestroy {
  private firestore = inject(Firestore);
  private subscription?: Subscription;

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  readonly isLoading$ = this.loadingSubject.asObservable();

  // Raw, unfiltered — used by admin screens (list/edit/view all venues).
  private readonly allVenuesSubject = new BehaviorSubject<TrainingVenue[]>([]);
  readonly allVenues$ = this.allVenuesSubject.asObservable();

  // Public-facing — active venues only. Unchanged behaviour for existing callers.
  readonly venues$ = this.allVenuesSubject.pipe(
    map((venues) => venues.filter((venue) => venue.isActive)),
  );

  constructor() {
    this.loadVenues();
  }

  private loadVenues(): void {
    this.loadingSubject.next(true);

    const ref = collection(this.firestore, 'training-venues');

    this.subscription = collectionData(ref, { idField: 'id' })
      .pipe(
        map((data) => (data as TrainingVenue[]).sort((a, b) => a.name.localeCompare(b.name))),
      )
      .subscribe({
        next: (venues) => {
          this.allVenuesSubject.next(venues);
          this.loadingSubject.next(false);
        },
        error: (error) => {
          console.error('Error loading training venues:', error);
          this.loadingSubject.next(false);
        },
      });
  }

  // ── Reads (unchanged) ─────────────────────────────────────
  getAll(): Observable<TrainingVenue[]> {
    return this.venues$;
  }

  getAllIncludingInactive(): Observable<TrainingVenue[]> {
    return this.allVenues$;
  }

  getCount(): Observable<number> {
    return this.venues$.pipe(map((venues) => venues.length));
  }

  getActive(): Observable<TrainingVenue[]> {
    return this.venues$.pipe(map((venues) => venues.filter((venue) => venue.isActive)));
  }

  getById(id: string): Observable<TrainingVenue | undefined> {
    return this.allVenues$.pipe(map((venues) => venues.find((venue) => venue.id === id)));
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

  // ── Writes (new — admin CRUD) ─────────────────────────────
  async create(input: VenueFormInput): Promise<string> {
    const ref = collection(this.firestore, 'training-venues');
    const docRef = await addDoc(ref, {
      ...input,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async update(id: string, input: VenueFormInput): Promise<void> {
    const venueRef = doc(this.firestore, `training-venues/${id}`);
    await updateDoc(venueRef, {
      ...input,
      updatedAt: serverTimestamp(),
    });
  }

  async setActive(id: string, isActive: boolean): Promise<void> {
    const venueRef = doc(this.firestore, `training-venues/${id}`);
    await updateDoc(venueRef, { isActive, updatedAt: serverTimestamp() });
  }

  async delete(id: string): Promise<void> {
    const venueRef = doc(this.firestore, `training-venues/${id}`);
    await deleteDoc(venueRef);
    // Note: sessions referencing this venueId are NOT cleaned up automatically.
    // Consider a Cloud Function trigger for that in production.
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
