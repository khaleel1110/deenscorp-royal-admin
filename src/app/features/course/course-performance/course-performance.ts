import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';



export interface CoursePerformanceItem {
  label: string;
  title: string;
  value: string;
  trend?: string;
  trendTone?: 'success' | 'danger' | 'muted';
}


@Component({
  selector: 'app-course-performance',

  standalone: true,

  imports: [SkeletonComponent, SkeletonComponent],

  template: `
    <div class="card h-100">
      <!-- Header -->
      <div class="card-header">
        <h4 class="card-header-title">
          {{ title() }}
        </h4>

        @if (showViewAll()) {
          <a href="javascript:;" class="text-primary">
            {{ viewAllText() }}
          </a>
        }
      </div>

      <!-- Body -->
      <div class="card-body">
        @if (loading()) {
          <!-- Loading State -->

          <div class="row">
            @for (item of items(); track item.label) {
              <div class="col-md-4">
                <app-skeleton shape="line" width="100px" height="10px" class="mb-2" />

                <app-skeleton shape="line" width="150px" height="24px" class="mb-2" />

                <app-skeleton shape="line" width="100px" height="10px" />
              </div>
            }
          </div>
        } @else {
          <!-- Performance Items -->

          <div class="row">
            @for (item of items(); track item.label) {
              <div class="col-md-4">
                <div class="small-muted mb-2">
                  {{ item.label }}
                </div>

                <h3 class="mb-0">
                  {{ item.title }}
                </h3>

                @if (item.trend) {
                  <span [class]="'performance-value text-' + (item.trendTone ?? 'success')">
                    {{ item.value }}
                  </span>
                } @else {
                  <span class="performance-value">
                    {{ item.value }}
                  </span>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,

  styles: [
    `
      .performance-value {
        display: inline-block;
        margin-top: 0.25rem;
        font-size: 0.8125rem;
        font-weight: 500;
      }
    `,
  ],

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursePerformance {
  readonly title = input('Course performance');

  readonly viewAllText = input('View all');

  readonly showViewAll = input(true);

  readonly items = input.required<CoursePerformanceItem[]>();

  readonly loading = input(false);
}
