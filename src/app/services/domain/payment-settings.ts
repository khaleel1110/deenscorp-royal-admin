import { inject, Injectable } from '@angular/core';
import { Firestore, doc, docData, setDoc, serverTimestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface PaymentSettings {
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCodeOrSwift: string;
  additionalInstructions?: string;
  updatedAt?: any;
}

@Injectable({ providedIn: 'root' })
export class PaymentSettingsService {
  private readonly firestore = inject(Firestore);
  private readonly ref = doc(this.firestore, 'settings/paymentInfo');

  get(): Observable<PaymentSettings | undefined> {
    return docData(this.ref) as Observable<PaymentSettings | undefined>;
  }

  async save(settings: Omit<PaymentSettings, 'updatedAt'>): Promise<void> {
    await setDoc(this.ref, { ...settings, updatedAt: serverTimestamp() });
  }
}
