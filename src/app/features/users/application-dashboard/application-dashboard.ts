import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { DashboardStat } from '../../dashboard/main-dashboard/dashboard-stat/dashboard-stat';
import {
  GroupedBarChartComponent,
  GroupedBarDataset,
} from '../../../shared/components/grouped-bar-chart/grouped-bar-chart.component';

import { CourseApplication, CourseApplicationService } from '../../../services/domain/course-application';

@Component({
  selector: 'app-application-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardStat, GroupedBarChartComponent],
  templateUrl: './application-dashboard.html',
  styleUrl: './application-dashboard.scss',
})
export class ApplicationDashboard implements OnInit, OnDestroy {
  private subscription?: Subscription;

  totalApplications = 0;
  pendingReview = 0;
  awaitingPayment = 0;
  totalRevenue = 0;
  loading = true;

  barLabels: string[] = [];
  barDatasets: GroupedBarDataset[] = [];

  constructor(private readonly applicationService: CourseApplicationService) {}

  ngOnInit(): void {
    this.subscription = this.applicationService.getAll().subscribe({
      next: (apps) => {
        this.totalApplications = apps.length;
        this.pendingReview = apps.filter((a) => a.status === 'pending').length;
        this.awaitingPayment = apps.filter(
          (a) => a.status === 'approved' && a.paymentStatus === 'unpaid',
        ).length;
        this.totalRevenue = apps
          .filter((a) => a.paymentStatus === 'paid')
          .reduce((sum, a) => sum + (a.totalPaid ?? a.amountDue ?? 0), 0);

        this.buildCourseBreakdown(apps);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load application dashboard data', err);
        this.loading = false;
      },
    });
  }

  private buildCourseBreakdown(apps: CourseApplication[]): void {
    const counts = new Map<string, number>();

    for (const app of apps) {
      counts.set(app.courseName, (counts.get(app.courseName) ?? 0) + 1);
    }

    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

    this.barLabels = sorted.map(([name]) => name);
    this.barDatasets = [
      {
        label: 'Applications',
        data: sorted.map(([, count]) => count),
        backgroundColor: sorted.map(() => '#ed3600'),
      },
    ];
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
