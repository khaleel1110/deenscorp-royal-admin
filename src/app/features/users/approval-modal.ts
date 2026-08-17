import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { take } from 'rxjs/operators';
import {
  CourseApplication,
  CourseApplicationService,
} from '../../services/domain/course-application';
import { CourseSessionService } from '../../services/domain/course-session-service';

@Component({
  selector: 'app-approval-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Approve Application</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      @if (error()) {
        <div class="alert alert-danger">{{ error() }}</div>
      }

      <!-- Applicant and course details -->
      <div class="mb-3 p-3 bg-light rounded">
        <div class="small text-muted">APPLICANT</div>
        <div class="fw-semibold">{{ application.fullName }}</div>
        <div class="text-muted small">{{ application.email }} · {{ application.phone }}</div>
        <div class="mt-2"><strong>Course:</strong> {{ application.courseName }}</div>
        <div><strong>Session:</strong> {{ application.session || '—' }}</div>
        <div><strong>Delivery:</strong> {{ application.deliveryMode || '—' }}</div>
        @if (application.organization) {
          <div><strong>Organization:</strong> {{ application.organization }}</div>
        }
      </div>

      <!-- Approval form -->
      <form [formGroup]="form">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Amount Due *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              class="form-control"
              formControlName="amount"
            />
          </div>
          <div class="col-md-6">
            <label class="form-label">Currency</label>
            <input class="form-control" formControlName="currency" />
          </div>
          <div class="col-12">
            <label class="form-label">Admin Notes</label>
            <textarea
              class="form-control"
              rows="2"
              formControlName="adminNotes"
              placeholder="Internal notes…"
            ></textarea>
          </div>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-light" (click)="activeModal.dismiss()">Cancel</button>
      <button class="btn btn-success" [disabled]="saving()" (click)="approve()">
        @if (saving()) {
          <span class="spinner-border spinner-border-sm me-2"></span>
        }
        Approve & Send Payment Instructions
      </button>
    </div>
  `,
})
export class ApprovalModal implements OnInit {
  @Input({ required: true }) application!: CourseApplication;

  private readonly fb = inject(FormBuilder);
  private readonly applicationService = inject(CourseApplicationService);
  private readonly sessionService = inject(CourseSessionService);
  readonly activeModal = inject(NgbActiveModal);

  form!: FormGroup;
  readonly saving = signal(false);
  readonly error = signal('');

  ngOnInit(): void {
    // Use the stored session price as default, fallback to amountDue or 0
    const defaultAmount = this.application.sessionPrice ?? this.application.amountDue ?? 0;

    this.form = this.fb.group({
      amount: [defaultAmount, [Validators.required, Validators.min(0.01)]],
      currency: [
        this.application.sessionCurrency || this.application.currency || 'USD',
        Validators.required,
      ],
      adminNotes: [this.application.adminNotes || ''],
    });

    // Automatically pre‑fill amount from the session price
    if (this.application.sessionId) {
      this.sessionService
        .getByIdGlobally(this.application.sessionId)
        .pipe(take(1))
        .subscribe((session) => {
          if (session?.price && session.price > 0) {
            this.form.patchValue({ amount: session.price });
          }
        });
    }
  }

  async approve(): Promise<void> {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set('');
    try {
      const { amount, currency, adminNotes } = this.form.value;
      await this.applicationService.approve(this.application.id, amount, currency, adminNotes);
      this.activeModal.close(true);
    } catch (err: any) {
      this.error.set(err?.message || 'Approval failed.');
    } finally {
      this.saving.set(false);
    }
  }
}
