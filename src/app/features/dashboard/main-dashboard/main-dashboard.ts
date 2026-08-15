import { Component, inject } from '@angular/core';

import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

import { toSignal } from '@angular/core/rxjs-interop';
import { CourseService } from '../../../services/domain/course';
import { CourseCategory, CourseCategoryService } from '../../../services/domain/course-category';
import {JsonPipe} from "@angular/common";
import {PieChartDashboard} from './pie-chart-dashboard/pie-chart-dashboard';
import {StatCardComponent} from '../../../shared/components/stat-card/stat-card.component';
import {DashboardStat} from './dashboard-stat/dashboard-stat';
import { PageFooterComponent } from '../../../shared/components/page-footer/page-footer.component';
import {
  GroupedBarChartComponent,
  GroupedBarDataset,
} from '../../../shared/components/grouped-bar-chart/grouped-bar-chart.component';
import {
  DonutChartComponent,
  DonutItem,
} from '../../../shared/components/donut-chart/donut-chart.component';
import { CoursePerformance, CoursePerformanceItem } from '../../course/course-performance/course-performance';



@Component({
  selector: 'app-main-dashboard',
  imports: [
    PieChartDashboard,
    DashboardStat,
    PageFooterComponent,
    GroupedBarChartComponent,
    CoursePerformance,
  ],
  templateUrl: './main-dashboard.html',
  styleUrl: './main-dashboard.scss',
})
export class MainDashboard {
  constructor() {
    this.courseService.courses$.subscribe((courses) => {
      console.log(courses);
    });

    setTimeout(() => {
      console.log('Signal Courses', this.course());
    }, 3000);
  }

  private offcanvasService = inject(NgbOffcanvas);
  private courseService = inject(CourseService);
  private courseCategoryService = inject(CourseCategoryService);

  // Signals from Firestore
  course = toSignal(this.courseService.courses$, { initialValue: [] });

  feeCollectionLabels = ['Mar', 'Apr', 'May', 'Jun', 'Jul'];

  feeCollectionDatasets: GroupedBarDataset[] = [
    {
      label: 'Management',
      data: [120000, 150000, 180000, 210000, 250000],
    },

    {
      label: 'Inspection',
      data: [80000, 100000, 130000, 170000, 190000],

    },
  ];

  readonly totalCourses = 248;

  readonly courseStatusItems: DonutItem[] = [
    {
      label: 'Published',
      value: 104,
      color: '#377dff',
    },

    {
      label: 'Draft',
      value: 62,
      color: '#00c9a7',
    },

    {
      label: 'Pending Review',
      value: 48,
      color: '#f7b924',
    },

    {
      label: 'Archived',
      value: 34,
      color: '#ed4c78',
    },
  ];

  readonly courseLabels = ['Mar', 'Apr', 'May', 'Jun', 'Jul'];

  readonly courseDatasets = [
    {
      label: 'Enrollments',
      data: [320, 450, 520, 680, 820],
      color: '#377dff',
    },

    {
      label: 'Completions',
      data: [180, 240, 310, 420, 560],
      color: '#00c9a7',
    },
  ];

  readonly coursePerformance: CoursePerformanceItem[] = [
    {
      label: 'Most enrolled',
      title: 'Web Development',
      value: '2,840 students',
      trend: '+18.4%',
      trendTone: 'success',
    },

    {
      label: 'Best completion',
      title: 'Digital Marketing',
      value: '86.4%',
      trend: '+6.2%',
      trendTone: 'success',
    },

    {
      label: 'New this month',
      title: '18 courses',
      value: '+12.5%',
      trend: '+12.5%',
      trendTone: 'success',
    },
  ];
}
