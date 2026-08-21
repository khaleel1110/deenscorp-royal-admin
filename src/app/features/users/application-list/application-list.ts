import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { toSignal } from '@angular/core/rxjs-interop';


// TODO: point this at wherever your ngTabs/ngTabList/ngTab directives
// actually live — same ones used for e.g. "Staff profile sections".

import { DashboardStat } from '../../dashboard/main-dashboard/dashboard-stat/dashboard-stat';
import {
  CourseApplication,
  CourseApplicationService,
} from '../../../services/domain/course-application';
import { ApplicationModal } from '../application-modal/application-modal';
import { PaymentModal } from '../payment-modal/payment-modal';
import { AccessModal } from '../access-modal/access-modal';
import { ApproveApplicationModal } from '../approve-application-modal/approve-application-modal';
import { Tab, TabContent, TabList, TabPanel, Tabs } from '@angular/aria/tabs';
import {RejectApplicationModal} from '../reject-application-modal/reject-application-modal';

type ApplicationTab = 'all' | 'pending' | 'awaiting-payment' | 'paid' | 'rejected';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DashboardStat, NgbDropdownModule,  Tabs,
    TabList,
    Tab,

    ],
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
  readonly selectedTab = signal<ApplicationTab>('all');

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const tab = this.selectedTab();

    return this.applications().filter((app) => {
      const matchesQuery =
        !q ||
        app.fullName.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        app.courseName.toLowerCase().includes(q);

      if (!matchesQuery) return false;

      switch (tab) {
        case 'pending':
          return app.status === 'pending';
        case 'awaiting-payment':
          return app.status === 'approved' && app.paymentStatus === 'unpaid';
        case 'paid':
          return app.paymentStatus === 'paid';
        case 'rejected':
          return app.status === 'rejected';
        case 'all':
        default:
          return true;
      }
    });
  });

  // ── Tab badge counts ─────────────────────────────────────
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
  readonly rejectedCount = computed(
    () => this.applications().filter((a) => a.status === 'rejected').length,
  );

  updateSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  // ── Actions ──────────────────────────────────────────────
  openEditModal(app: CourseApplication): void {
    const ref = this.modalService.open(ApplicationModal, { size: 'lg' });
    ref.componentInstance.application = app;
  }

  openAccessModal(app: CourseApplication): void {
    const ref = this.modalService.open(AccessModal, { size: 'md' });
    ref.componentInstance.application = app;
  }

  approve(app: CourseApplication): void {
    const ref = this.modalService.open(ApproveApplicationModal, { size: 'lg', backdrop: 'static' });
    ref.componentInstance.application = app;
  }

  reject(app: CourseApplication): void {
    const ref = this.modalService.open(RejectApplicationModal, {
      size: 'lg',
      backdrop: 'static',
      centered: true,
    });

    ref.componentInstance.application = app;

    ref.result.then(
      (result) => {
        if (result === true) {
          // Optional:
          // refresh applications here if your list doesn't update automatically.
          console.log('Application rejected successfully');
        }
      },
      () => {
        // Modal dismissed — nothing to do.
      }
    );
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
