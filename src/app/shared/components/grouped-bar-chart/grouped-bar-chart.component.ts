import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild, inject } from '@angular/core';
import { BarController, BarElement, CategoryScale, Chart, ChartConfiguration, LinearScale, Tooltip } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

export interface GroupedBarDataset {
  label: string;
  data: number[];
  color?: string;
}

@Component({
  selector: 'app-grouped-bar-chart',
  template: `
    <div class="grouped-bar-chart" [style.height.px]="height">
      <canvas #canvas role="img" [attr.aria-label]="ariaLabel"></canvas>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupedBarChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  @ViewChild('canvas') private readonly canvas?: ElementRef<HTMLCanvasElement>;

  @Input({ required: true }) labels: string[] = [];
  @Input({ required: true }) datasets: GroupedBarDataset[] = [];
  @Input() height = 220;
  @Input() currency = true;
  @Input() ariaLabel = 'Grouped bar chart';

  private chart?: Chart<'bar'>;
  private viewReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.render();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.viewReady) this.render();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(): void {
    const context = this.canvas?.nativeElement.getContext('2d');
    if (!context) return;

    this.chart?.destroy();
    this.chart = new Chart(context, this.config());
  }

  private config(): ChartConfiguration<'bar'> {
    const style = getComputedStyle(this.host.nativeElement);
    const textMuted = this.cssVar(style, '--wf-text-muted', '#64748b');
    const border = this.cssVar(style, '--wf-border', '#e2e8f0');
    const colors = [
      this.cssVar(style, '--wf-success', '#16833b'),
      this.cssVar(style, '--wf-primary', '#0f9d58'),
      this.cssVar(style, '--wf-warning', '#f29900'),
    ];
    const reduceMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: this.datasets.map((dataset, index) => ({
          label: dataset.label,
          data: dataset.data,
          backgroundColor: dataset.color ?? colors[index % colors.length],
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.68,
          categoryPercentage: 0.62,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: reduceMotion ? false : { duration: 650, easing: 'easeOutCubic' },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => `${item.dataset.label}: ${this.formatValue(Number(item.raw ?? 0))}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: textMuted, font: { size: 11, weight: 600 } },
          },
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: border },
            ticks: {
              color: textMuted,
              callback: (value) => this.formatValue(Number(value)),
            },
          },
        },
      },
    };
  }

  private formatValue(value: number): string {
    if (!this.currency) return new Intl.NumberFormat('en-NG', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', notation: 'compact', maximumFractionDigits: 1 }).format(value).replace('NGN', '₦');
  }

  private cssVar(style: CSSStyleDeclaration, name: string, fallback: string): string {
    return style.getPropertyValue(name).trim() || fallback;
  }
}
