import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {
  ApplicationPayment,
  CourseApplicationService,
} from '../../../services/domain/course-application';
import { ApplicationModal } from '../application-modal/application-modal';
import { PaymentModal } from '../payment-modal/payment-modal';

@Component({
  selector: 'app-application-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './application-view.html',
  styleUrl: './application-view.scss',
})
export class ApplicationView {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly applicationService = inject(CourseApplicationService);
  private readonly modalService = inject(NgbModal);

  readonly applicationId = toSignal(this.route.paramMap.pipe(map((p) => p.get('id'))), {
    initialValue: null,
  });

  readonly application = toSignal(
    toObservable(this.applicationId).pipe(
      switchMap((id) => (id ? this.applicationService.getById(id) : of(undefined))),
    ),
    { initialValue: undefined },
  );

  readonly payments = toSignal(
    toObservable(this.applicationId).pipe(
      switchMap((id) => (id ? this.applicationService.getPayments(id) : of([]))),
    ),
    { initialValue: [] as ApplicationPayment[] },
  );

  readonly loading = computed(() => !this.application());

  readonly isVirtual = computed(() => {
    const mode = this.application()?.deliveryMode?.toLowerCase() ?? '';
    return mode.includes('virtual') || mode.includes('online');
  });

  formatDate(date: any): string {
    if (!date) return '—';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatDateTime(date: any): string {
    if (!date) return '—';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  }

  // ── Actions ──────────────────────────────────────────────
  openEditModal(): void {
    const app = this.application();
    if (!app) return;
    const ref = this.modalService.open(ApplicationModal, { size: 'lg' });
    ref.componentInstance.application = app;
  }

  async approve(): Promise<void> {
    const app = this.application();
    if (!app) return;

    const amountStr = prompt(`Amount due for "${app.courseName}":`, app.amountDue?.toString() ?? '');
    if (amountStr === null) return;

    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert('Enter a valid amount.');
      return;
    }

    await this.applicationService.approve(app.id, amount, app.currency ?? 'USD');
  }

  async reject(): Promise<void> {
    const app = this.application();
    if (!app) return;

    const reason = prompt('Reason (optional):') ?? '';
    if (!window.confirm(`Reject the application from ${app.fullName}?`)) return;

    await this.applicationService.reject(app.id, reason || undefined);
  }

  openRecordPaymentModal(): void {
    const app = this.application();
    if (!app) return;
    const ref = this.modalService.open(PaymentModal, { size: 'md' });
    ref.componentInstance.application = app;
  }

  async deleteApplication(): Promise<void> {
    const app = this.application();
    if (!app) return;

    if (!window.confirm(`Delete the application from "${app.fullName}"? This cannot be undone.`)) {
      return;
    }

    await this.applicationService.delete(app.id);
    this.router.navigate(['/gms/applications']);
  }
}
