import { inject, Injectable } from '@angular/core';
import {
  Firestore, collection, collectionData, doc, docData,
  addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type PaymentStatus = 'unpaid' | 'paid';
export type ApplicationPurpose =
  | 'Personal Development'
  | 'Company Sponsored'
  | 'Career Change'
  | 'Academic / Research'
  | 'Other';

export interface CourseApplication {
  id: string;

  // Applicant
  fullName: string;
  email: string;
  phone: string;
  organization?: string | null;
  jobTitle?: string | null;

  // Purpose / sponsorship
  purpose?: ApplicationPurpose | null;
  isSponsored?: boolean;
  sponsorName?: string | null;
  sponsorEmail?: string | null;
  sponsorPhone?: string | null;

  // Course / Session
  courseId: string;
  courseName: string;
  sessionId?: string | null;
  session?: string | null; // formatted display string, e.g. "Classroom - 12 Mar 2026"
  sessionDate?: any;
  deliveryMode?: string | null; // 'Classroom' | 'Online' | 'Virtual' | 'Onsite'
  venueId?: string | null;
  venueName?: string | null;
  message?: string | null;

  // Application review
  status: ApplicationStatus;
  adminNotes?: string | null;
  approvedAt?: any;
  rejectedAt?: any;

  // Payment
  paymentStatus: PaymentStatus;
  amountDue?: number | null;
  currency?: string | null;
  paymentReference?: string | null;
  paidAt?: any;
  totalPaid?: number;

  // Access (virtual meeting link / venue confirmation)
  meetingLink?: string | null;
  /** True when the applicant is using the session's shared link as-is (no per-applicant override). */
  usesSessionMeetingLink?: boolean;
  accessNotes?: string | null;
  accessDetailsSent?: boolean;

  // Email tracking (set by Cloud Functions)
  emailStatus?: string;
  approvalEmailStatus?: string;
  paymentEmailStatus?: string;
  accessEmailStatus?: string;

  createdAt: any;
  updatedAt?: any;
}

export interface ApplicationPayment {
  id: string;
  amount: number;
  currency: string;
  method: string; // 'Bank Transfer' | 'Card' | 'Cash' | 'Other'
  reference?: string | null;
  proofUrl?: string | null;
  notes?: string | null;
  recordedAt: any;
  recordedBy?: string | null;
}

export type ApplicationUpdateInput = Partial<
  Pick<
    CourseApplication,
    | 'fullName'
    | 'email'
    | 'phone'
    | 'organization'
    | 'jobTitle'
    | 'purpose'
    | 'isSponsored'
    | 'sponsorName'
    | 'sponsorEmail'
    | 'sponsorPhone'
    | 'message'
    | 'adminNotes'
    | 'meetingLink'
    | 'usesSessionMeetingLink'
    | 'accessNotes'
  >
>;

function generatePaymentReference(applicationId: string): string {
  return `DR-${applicationId.slice(0, 6).toUpperCase()}`;
}

@Injectable({ providedIn: 'root' })
export class CourseApplicationService {
  private readonly firestore = inject(Firestore);

  private readonly collectionPath = 'courseApplications';

  // ── Reads ──────────────────────────────────────────────────
  getAll(): Observable<CourseApplication[]> {
    const ref = collection(this.firestore, this.collectionPath);
    const q = query(ref, orderBy('createdAt', 'desc'));

    return collectionData(q, { idField: 'id' }) as Observable<CourseApplication[]>;
  }

  getById(id: string): Observable<CourseApplication | undefined> {
    const ref = doc(this.firestore, `${this.collectionPath}/${id}`);
    return (docData(ref, { idField: 'id' }) as Observable<CourseApplication>).pipe(
      map((app) => app ?? undefined),
    );
  }

  getPayments(applicationId: string): Observable<ApplicationPayment[]> {
    const ref = collection(this.firestore, `${this.collectionPath}/${applicationId}/payments`);
    const q = query(ref, orderBy('recordedAt', 'desc'));

    return collectionData(q, { idField: 'id' }) as Observable<ApplicationPayment[]>;
  }

  // ── Manual creation (e.g. phone/offline applications entered by admin) ──
  async create(input: Omit<CourseApplication, 'id' | 'status' | 'paymentStatus' | 'createdAt'>): Promise<string> {
    const ref = collection(this.firestore, this.collectionPath);
    const docRef = await addDoc(ref, {
      ...input,
      status: 'pending' as ApplicationStatus,
      paymentStatus: 'unpaid' as PaymentStatus,
      emailStatus: 'not_applicable', // admin-entered, no auto "received" email
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  // ── Edits (contact details, admin notes, meeting link) ──────
  async update(id: string, input: ApplicationUpdateInput): Promise<void> {
    const ref = doc(this.firestore, `${this.collectionPath}/${id}`);
    await updateDoc(ref, { ...input, updatedAt: serverTimestamp() });
  }

  /**
   * Sets the applicant's access details. `usesSessionMeetingLink: true`
   * means "just use whatever link is on the session" (the common case —
   * one shared room for the whole cohort); a value of `false` with a
   * `meetingLink` means this specific applicant gets a different link.
   * A Cloud Function watches these fields: once set AND the application
   * is already paid, it sends the final access-details email exactly once
   * (guarded by accessDetailsSent).
   */
  async setAccessDetails(
    id: string,
    input: { meetingLink?: string | null; usesSessionMeetingLink?: boolean; accessNotes?: string | null },
  ): Promise<void> {
    const ref = doc(this.firestore, `${this.collectionPath}/${id}`);
    await updateDoc(ref, { ...input, updatedAt: serverTimestamp() });
  }

  // ── Review actions ────────────────────────────────────────
  /**
   * Approves the application and stamps the amount due + a payment
   * reference code. Call this with the amount the admin confirmed in the
   * approval-review modal (normally pulled straight from the session's
   * price, occasionally overridden — e.g. discounts).
   */
  async approve(id: string, amountDue: number, currency = 'USD'): Promise<void> {
    const ref = doc(this.firestore, `${this.collectionPath}/${id}`);
    await updateDoc(ref, {
      status: 'approved' as ApplicationStatus,
      amountDue,
      currency,
      paymentReference: generatePaymentReference(id),
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async reject(id: string, reason?: string): Promise<void> {
    const ref = doc(this.firestore, `${this.collectionPath}/${id}`);
    await updateDoc(ref, {
      status: 'rejected' as ApplicationStatus,
      adminNotes: reason ?? null,
      rejectedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async recordPayment(
    applicationId: string,
    payment: Omit<ApplicationPayment, 'id' | 'recordedAt'>,
  ): Promise<string> {
    const ref = collection(
      this.firestore,
      `${this.collectionPath}/${applicationId}/payments`,
    );
    const docRef = await addDoc(ref, {
      ...payment,
      recordedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async delete(id: string): Promise<void> {
    const ref = doc(this.firestore, `${this.collectionPath}/${id}`);
    await deleteDoc(ref);
  }
}
