import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {
  ApplicationPayment,
  CourseApplication,
  CourseApplicationService,
} from '../../../services/domain/course-application';
import { ApplicationModal } from '../application-modal/application-modal';
import { PaymentModal } from '../payment-modal/payment-modal';
import { AccessModal } from '../access-modal/access-modal';
import { ApproveApplicationModal } from '../approve-application-modal/approve-application-modal';
import { RejectApplicationModal } from '../reject-application-modal/reject-application-modal';

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

  openAccessModal(): void {
    const app = this.application();
    if (!app) return;
    const ref = this.modalService.open(AccessModal, { size: 'md' });
    ref.componentInstance.application = app;
  }

  approve(): void {
    const app = this.application();
    if (!app) return;

    const ref = this.modalService.open(ApproveApplicationModal, { size: 'lg', backdrop: 'static' });
    ref.componentInstance.application = app;
  }


  reject(): void {
    const app = this.application();

    if (!app) return;

    const ref = this.modalService.open(RejectApplicationModal, {
      size: 'lg',
      backdrop: 'static',
      centered: true,
    });

    ref.componentInstance.application = app;

    ref.result.then(
      (result) => {
        if (result === true) {
          console.log('Application rejected successfully');
        }
      },
      () => {
        // Modal dismissed.
      }
    );
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
