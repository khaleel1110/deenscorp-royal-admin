import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import {
  CourseApplication,
  CourseApplicationService,
} from '../../../services/domain/course-application';

const PAYMENT_METHODS = ['Bank Transfer', 'Card', 'Cash', 'Other'];

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-modal.html',
  styleUrl: './payment-modal.scss',
})
export class PaymentModal implements OnInit {
  @Input({ required: true }) application!: CourseApplication;

  readonly activeModal = inject(NgbActiveModal);
  private readonly fb = inject(FormBuilder);
  private readonly applicationService = inject(CourseApplicationService);

  readonly methods = PAYMENT_METHODS;

  form!: FormGroup;
  readonly saving = signal(false);
  readonly error = signal('');

  ngOnInit(): void {
    const remaining = (this.application.amountDue ?? 0) - (this.application.totalPaid ?? 0);

    this.form = this.fb.group({
      amount: [remaining > 0 ? remaining : this.application.amountDue ?? 0, [Validators.required, Validators.min(0.01)]],
      currency: [this.application.currency ?? 'USD', Validators.required],
      method: ['Bank Transfer', Validators.required],
      reference: [this.application.paymentReference ?? ''],
      proofUrl: [''],
      notes: [''],
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');

    try {
      const v = this.form.value;

      await this.applicationService.recordPayment(this.application.id, {
        amount: Number(v.amount),
        currency: v.currency,
        method: v.method,
        reference: v.reference || null,
        proofUrl: v.proofUrl || null,
        notes: v.notes || null,
        recordedBy: null, // set this to the current admin's uid/name if you have auth wired up
      });

      this.activeModal.close(true);
    } catch (err: any) {
      console.error('Failed to record payment:', err);
      this.error.set(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.activeModal.dismiss();
  }
}
