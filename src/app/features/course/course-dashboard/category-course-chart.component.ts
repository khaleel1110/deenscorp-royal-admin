import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, Subscription } from 'rxjs';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { CourseCategoryService } from '../../../services/domain/course-category';
import { CourseService } from '../../../services/domain/course';

@Component({
  selector: 'app-category-course-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card h-100">
      <div class="card-header card-header-content-sm-between">
        <h4 class="card-header-title mb-2 mb-sm-0">Courses by Category</h4>
      </div>
      <div class="card-body">
        <div class="chartjs-custom mx-auto" style="height: 20rem;">
          <canvas #chartCanvas></canvas>
        </div>
        <div class="row justify-content-center" *ngIf="categoriesWithCounts.length > 0">
          <div class="col-auto" *ngFor="let item of categoriesWithCounts">
            <span class="legend-indicator" [style.background-color]="item.color || '#000'"></span>
            {{ item.name }} ({{ item.count }})
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CategoryCourseChartComponent implements OnInit, AfterViewInit, OnDestroy {
  private static registered = false;

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | undefined;
  private subscriptions = new Subscription();

  categoriesWithCounts: { id: string; name: string; color: string; count: number }[] = [];

  constructor(
    private categoryService: CourseCategoryService,
    private courseService: CourseService,
    private cdr: ChangeDetectorRef,
  ) {
    if (!CategoryCourseChartComponent.registered) {
      Chart.register(...registerables);
      CategoryCourseChartComponent.registered = true;
    }
  }

  ngOnInit(): void {
    const sub = combineLatest([
      this.categoryService.categories$,
      this.courseService.courses$,
    ]).subscribe(([categories, courses]) => {
      const counts = new Map<string, number>();
      courses.forEach((course) => {
        const catId = course.categoryId;
        counts.set(catId, (counts.get(catId) || 0) + 1);
      });

      this.categoriesWithCounts = categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        color: cat.color || '#3780ff',
        count: counts.get(cat.id) || 0,
      }));

      this.updateChart();
      this.cdr.detectChanges();
    });
    this.subscriptions.add(sub);
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  private createChart(): void {
    if (!this.chartCanvas) return;
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'bubble',
      data: { datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: { display: false },
            border: { display: false },
            ticks: { display: false },
          },
          x: {
            min: 0,
            max: 100,
            grid: { display: false },
            border: { display: false },
            ticks: { display: false },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const raw = context.raw as any;
                return `${raw.label}: ${raw.count} course${raw.count !== 1 ? 's' : ''}`;
              },
            },
          },
        },
      },
    };

    this.chart = new Chart(ctx, config);
    this.updateChart();
  }

  private updateChart(): void {
    if (!this.chart) return;

    const total = this.categoriesWithCounts.length || 1;
    const data = this.categoriesWithCounts.map((item, index) => {
      const x = 5 + (index / total) * 90;
      const y = 30 + Math.random() * 40;
      const r = Math.min(50, Math.max(8, 8 + item.count * 4));
      return {
        x,
        y,
        r,
        label: item.name,
        count: item.count,
        color: item.color,
      };
    });

    this.chart.data.datasets = [
      {
        label: 'Categories',
        data: data,
        backgroundColor: data.map((d) => d.color),
        borderColor: 'transparent',
      },
    ];

    this.chart.update();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }
}
