// pie-chart-dashboard.ts
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  PieController,
} from 'chart.js';
import { combineLatest, Subscription } from 'rxjs';
import { CourseCategoryService } from '../../../../services/domain/course-category';
import { CourseService } from '../../../../services/domain/course';

// Register once (can be done globally, but safe here)
Chart.register(PieController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-pie-chart-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card h-100">
      <div class="card-header card-header-content-sm-between">
        <h4 class="card-header-title mb-2 mb-sm-0">Courses by Category</h4>
      </div>
      <div class="card-body">
        <div class="chartjs-custom mx-auto" style="height: 20rem;">
          <canvas #pieChart></canvas>
        </div>
        <!-- Optional legend (Chart.js can also show legend) -->
        <div class="row justify-content-center">
          <div class="col-auto" *ngFor="let slice of slices">
            <span class="legend-indicator" [style.background-color]="slice.color"></span>
            {{ slice.label }} ({{ slice.value }})
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .legend-indicator {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 2px;
      margin-right: 6px;
    }
  `]
})
export class PieChartDashboard implements AfterViewInit, OnDestroy {
  @ViewChild('pieChart') pieChart!: ElementRef<HTMLCanvasElement>;

  private chart!: Chart;
  private subscriptions = new Subscription();

  private categoryService = inject(CourseCategoryService);
  private courseService = inject(CourseService);
  private cdr = inject(ChangeDetectorRef);

  // Data for custom legend
  slices: { label: string; value: number; color: string }[] = [];

  ngAfterViewInit(): void {
    // Only create chart after view init
    this.createPieChart();

    // Subscribe to combined data
    const sub = combineLatest([
      this.categoryService.categories$,
      this.courseService.courses$,
    ]).subscribe(([categories, courses]) => {
      // Count courses per category
      const counts = new Map<string, number>();
      courses.forEach((course) => {
        const catId = course.categoryId;
        counts.set(catId, (counts.get(catId) || 0) + 1);
      });

      // Build slices
      this.slices = categories
        .filter((cat) => (counts.get(cat.id) || 0) > 0) // only categories with courses
        .map((cat) => ({
          label: cat.name,
          value: counts.get(cat.id) || 0,
          color: cat.color || '#3780ff', // fallback
        }));

      // If no categories with courses, show a placeholder
      if (this.slices.length === 0) {
        this.slices = [{ label: 'No data', value: 1, color: '#cccccc' }];
      }

      this.updateChart();
      this.cdr.detectChanges(); // update custom legend
    });
    this.subscriptions.add(sub);
  }

  private createPieChart(): void {
    const ctx = this.pieChart.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false, // we use custom legend
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                return ` ${label}: ${value} course${value !== 1 ? 's' : ''}`;
              },
            },
          },
        },
      },
    });

    this.updateChart();
  }

  private updateChart(): void {
    if (!this.chart) return;

    const labels = this.slices.map((s) => s.label);
    const data = this.slices.map((s) => s.value);
    const colors = this.slices.map((s) => s.color);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;
    this.chart.data.datasets[0].backgroundColor = colors;
    this.chart.update();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined as any;
    }
  }
}
