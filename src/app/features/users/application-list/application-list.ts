import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { toSignal } from '@angular/core/rxjs-interop';

import { DashboardStat } from '../../dashboard/main-dashboard/dashboard-stat/dashboard-stat';
import {
  CourseApplication,
  CourseApplicationService,
} from '../../../services/domain/course-application';
import { ApplicationModal } from '../application-modal/application-modal';
import { PaymentModal } from '../payment-modal/payment-modal';
import { ApprovalModal } from '../approval-modal';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DashboardStat, NgbDropdownModule],
  templateUrl: './application-list.html',
  styleUrl: './application-list.scss',
})
export class ApplicationList {
  private readonly applicationService = inject(CourseApplicationService);
  private readonly modalService = inject(NgbModal);

  readonly applications = toSignal(this.applicationService.getAll(), {
    initialValue: [] as CourseApplication[],
  });

  readonly query = signal('');
  readonly statusFilter = signal<string>('');
  readonly paymentFilter = signal<string>('');

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const status = this.statusFilter();
    const payment = this.paymentFilter();

    return this.applications().filter((app) => {
      const matchesQuery =
        !q ||
        app.fullName.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        app.courseName.toLowerCase().includes(q);

      const matchesStatus = !status || app.status === status;
      const matchesPayment = !payment || app.paymentStatus === payment;

      return matchesQuery && matchesStatus && matchesPayment;
    });
  });

  // ── Stats ────────────────────────────────────────────────
  readonly totalApplications = computed(() => this.applications().length);
  readonly pendingReview = computed(
    () => this.applications().filter((a) => a.status === 'pending').length,
  );
  readonly awaitingPayment = computed(
    () =>
      this.applications().filter((a) => a.status === 'approved' && a.paymentStatus === 'unpaid')
        .length,
  );
  readonly paidCount = computed(
    () => this.applications().filter((a) => a.paymentStatus === 'paid').length,
  );

  updateSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  // ── Actions ──────────────────────────────────────────────
  openEditModal(app: CourseApplication): void {
    const ref = this.modalService.open(ApplicationModal, { size: 'lg' });
    ref.componentInstance.application = app;
  }
  async approve(app: CourseApplication): Promise<void> {
    const ref = this.modalService.open(ApprovalModal, { size: 'lg' });
    ref.componentInstance.application = app;
    await ref.result.catch(() => false);
    // No manual refresh needed – Firestore real‑time updates will reflect changes
  }

  async reject(app: CourseApplication): Promise<void> {
    const reason = prompt(`Reason for rejecting "${app.fullName}"'s application (optional):`) ?? '';
    const confirmed = window.confirm(`Reject the application from ${app.fullName}?`);
    if (!confirmed) return;

    try {
      await this.applicationService.reject(app.id, reason || undefined);
    } catch (error) {
      console.error('Failed to reject application:', error);
      alert('Failed to reject. Please try again.');
    }
  }

  openRecordPaymentModal(app: CourseApplication): void {
    const ref = this.modalService.open(PaymentModal, { size: 'md' });
    ref.componentInstance.application = app;
  }

  async deleteApplication(app: CourseApplication): Promise<void> {
    const confirmed = window.confirm(
      `Delete the application from "${app.fullName}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await this.applicationService.delete(app.id);
    } catch (error) {
      console.error('Failed to delete application:', error);
      alert('Failed to delete. Please try again.');
    }
  }
}
