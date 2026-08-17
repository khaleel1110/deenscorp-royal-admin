import { inject, Injectable } from '@angular/core';
import {
  Firestore, collection, collectionData, doc, docData,
  addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type PaymentStatus = 'unpaid' | 'paid';

export interface CourseApplication {
  id: string;

  // Applicant
  fullName: string;
  email: string;
  phone: string;
  organization?: string | null;

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
  isFeatured: boolean;
  meetingLink?: string; // NEW — only populated for Online/Virtual sessions
  meetingEventId?: string;

  sessionPrice?: number | null;
  sessionCurrency?: string | null;

  // Payment fields (set during approval)
  amountDue?: number | null;
  currency?: string | null;

  // Application review
  status: ApplicationStatus;
  adminNotes?: string | null;
  approvedAt?: any;
  rejectedAt?: any;

  // Payment
  paymentStatus: PaymentStatus;
  paymentReference?: string | null;
  paidAt?: any;
  totalPaid?: number;

  // Access (virtual meeting link / venue confirmation)

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
    | 'message'
    | 'adminNotes'
    | 'meetingLink'
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
  async create(
    input: Omit<CourseApplication, 'id' | 'status' | 'paymentStatus' | 'createdAt'>,
  ): Promise<string> {
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
   * Sets the Google Meet / joining link (or venue access notes).
   * A Cloud Function watches this field: once it's set AND the
   * application is already paid, it sends the final access-details
   * email exactly once (guarded by accessDetailsSent).
   */
  async setMeetingLink(id: string, meetingLink: string, accessNotes?: string): Promise<void> {
    const ref = doc(this.firestore, `${this.collectionPath}/${id}`);
    await updateDoc(ref, {
      meetingLink,
      accessNotes: accessNotes ?? null,
      updatedAt: serverTimestamp(),
    });
  }

  // ── Review actions ────────────────────────────────────────
  /**
   * Approves the application and stamps the amount due + a payment
   * reference code. A Cloud Function watches `status` transitioning
   * to 'approved' and sends the payment-instructions email using
   * these two fields plus the bank details in settings/paymentInfo.
   */
  async approve(
    id: string,
    amountDue: number,
    currency = 'USD',
    adminNotes?: string,
  ): Promise<void> {
    const ref = doc(this.firestore, `${this.collectionPath}/${id}`);
    const updateData: any = {
      status: 'approved' as ApplicationStatus,
      amountDue,
      currency,
      paymentReference: generatePaymentReference(id),
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }
    await updateDoc(ref, updateData);
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

  /**
   * Records a payment in the payments subcollection. A Cloud Function
   * watches document creation there: it sums payments, flips the
   * parent's paymentStatus to 'paid' once amountDue is covered, and
   * sends the payment-confirmed email (including the meeting link if
   * it's already set).
   */
  async recordPayment(
    applicationId: string,
    payment: Omit<ApplicationPayment, 'id' | 'recordedAt'>,
  ): Promise<string> {
    const ref = collection(this.firestore, `${this.collectionPath}/${applicationId}/payments`);
    const docRef = await addDoc(ref, {
      ...payment,
      recordedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async delete(id: string): Promise<void> {
    const ref = doc(this.firestore, `${this.collectionPath}/${id}`);
    await deleteDoc(ref);
    // Note: the payments subcollection is NOT deleted automatically —
    // clean it up via a Cloud Function trigger if you need hard deletes.
  }
}
