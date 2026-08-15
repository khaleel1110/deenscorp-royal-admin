// course-dashboard.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, Subscription, forkJoin } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import { DashboardStat } from '../../dashboard/main-dashboard/dashboard-stat/dashboard-stat';
import { CategoryCourseChartComponent } from './category-course-chart.component';
import { PieChartDashboard } from '../../dashboard/main-dashboard/pie-chart-dashboard/pie-chart-dashboard';

import { CourseCategoryService } from '../../../services/domain/course-category';
import { CourseService } from '../../../services/domain/course';
import {
  GroupedBarChartComponent,
  GroupedBarDataset,
} from '../../../shared/components/grouped-bar-chart/grouped-bar-chart.component';

@Component({
  selector: 'app-course-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DashboardStat,
    CategoryCourseChartComponent,
    PieChartDashboard,
    GroupedBarChartComponent, // ✅ add this
  ],
  templateUrl: './course-dashboard.html',
  styleUrl: './course-dashboard.scss',
})
export class CourseDashboard implements OnInit, OnDestroy {
  private subscriptions = new Subscription();

  // Stats
  totalCourses = 0;
  totalCategories = 0;
  activeCourses = 0;
  totalTopics = 0;
  loading = true;

  // Bar chart data
  barLabels: string[] = [];
  barDatasets: GroupedBarDataset[] = [];

  constructor(
    private categoryService: CourseCategoryService,
    private courseService: CourseService,
  ) {}

  ngOnInit(): void {
    // 1. Totals
    const totals$ = combineLatest([
      this.courseService.getCount(),
      this.categoryService.getCount(),
    ]).pipe(map(([courseCount, categoryCount]) => ({ courseCount, categoryCount })));

    // 2. Active courses
    const activeCourses$ = this.courseService.courses$.pipe(
      map((courses) => courses.filter((c) => c.isActive).length),
    );

    // 3. Total topics (simplified; adjust as needed)
    const topics$ = this.courseService.courses$.pipe(
      take(1),
      switchMap((courses) => {
        const topicObservables = courses.map((course) =>
          this.courseService.getTopics(course.id).pipe(take(1)),
        );
        if (topicObservables.length === 0) return [0];
        return forkJoin(topicObservables).pipe(
          map((topicsArrays) => topicsArrays.reduce((sum, topics) => sum + topics.length, 0)),
        );
      }),
    );

    // 4. Bar chart data: courses per category
    const barData$ = combineLatest([
      this.categoryService.categories$,
      this.courseService.courses$,
    ]).pipe(
      map(([categories, courses]) => {
        // Count courses per category
        const counts = new Map<string, number>();
        courses.forEach((course) => {
          const catId = course.categoryId;
          counts.set(catId, (counts.get(catId) || 0) + 1);
        });

        // Build arrays, only include categories with at least one course
        const items = categories
          .map((cat) => ({
            name: cat.name,
            count: counts.get(cat.id) || 0,
            color: cat.color || '#0f9d58', // fallback
          }))
          .filter((item) => item.count > 0);

        return {
          labels: items.map((item) => item.name),
          datasets: [
            {
              label: 'Courses',
              data: items.map((item) => item.count),
              backgroundColor: items.map((item) => item.color), // per‑bar colours
            },
          ] as GroupedBarDataset[],
        };
      }),
    );

    // Combine all streams
    const combined$ = combineLatest([totals$, activeCourses$, topics$, barData$]).pipe(
      map(([{ courseCount, categoryCount }, activeCount, topicCount, barData]) => ({
        courseCount,
        categoryCount,
        activeCount,
        topicCount,
        barLabels: barData.labels,
        barDatasets: barData.datasets,
      })),
    );

    const sub = combined$.subscribe({
      next: (data) => {
        this.totalCourses = data.courseCount;
        this.totalCategories = data.categoryCount;
        this.activeCourses = data.activeCount;
        this.totalTopics = data.topicCount;
        this.barLabels = data.barLabels;
        this.barDatasets = data.barDatasets;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
        this.loading = false;
      },
    });

    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
