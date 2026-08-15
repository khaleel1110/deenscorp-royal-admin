import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { DashboardStat } from '../../dashboard/main-dashboard/dashboard-stat/dashboard-stat';
import {
  GroupedBarChartComponent,
  GroupedBarDataset,
} from '../../../shared/components/grouped-bar-chart/grouped-bar-chart.component';

import { FeaturedCourse, FeaturedCourseService } from '../../../services/domain/featured-course';

@Component({
  selector: 'app-featured-course-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardStat, GroupedBarChartComponent],
  templateUrl: './featured-course-dashboard.html',
  styleUrl: './featured-course-dashboard.scss',
})
export class FeaturedCourseDashboard implements OnInit, OnDestroy {
  private subscription?: Subscription;

  totalFeatured = 0;
  activeFeatured = 0;
  avgRating = 0;
  totalReviews = 0;
  loading = true;

  barLabels: string[] = [];
  barDatasets: GroupedBarDataset[] = [];

  topRated: FeaturedCourse[] = [];

  constructor(private readonly featuredCourseService: FeaturedCourseService) {}

  ngOnInit(): void {
    this.subscription = this.featuredCourseService.allFeaturedCourses$.subscribe({
      next: (items) => {
        this.totalFeatured = items.length;
        this.activeFeatured = items.filter((i) => i.isActive).length;
        this.totalReviews = items.reduce((sum, i) => sum + (i.reviewCount ?? 0), 0);

        this.avgRating = items.length
          ? Math.round(
              (items.reduce((sum, i) => sum + (i.rating ?? 0), 0) / items.length) * 10,
            ) / 10
          : 0;

        this.topRated = [...items]
          .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
          .slice(0, 8);

        this.barLabels = this.topRated.map((i) => i.title);
        this.barDatasets = [
          {
            label: 'Rating',
            data: this.topRated.map((i) => i.rating ?? 0),
            backgroundColor: this.topRated.map((i) =>
              i.isActive ? '#ed3600' : '#adb5bd',
            ),
          },
        ];

        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load featured course dashboard data', err);
        this.loading = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
