// grouped-bar-chart.ts
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  inject,
  input,
} from '@angular/core';

import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartConfiguration,
  LinearScale,
  Tooltip,
} from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

// ✅ Updated interface: allow per‑bar colours via backgroundColor array
export interface GroupedBarDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[]; // can be single colour or array
}

@Component({
  selector: 'app-grouped-bar-chart',
  standalone: true,
  imports: [],
  template: `
    <div class="grouped-bar-chart" [style.height.px]="height()">
      <canvas #canvas role="img" [attr.aria-label]="ariaLabel()"></canvas>
    </div>
  `,
  styles: [
    `
      .grouped-bar-chart {
        position: relative;
        width: 100%;
      }
      .grouped-bar-chart canvas {
        display: block;
        width: 100% !important;
        height: 100% !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupedBarChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  @ViewChild('canvas')
  private readonly canvas?: ElementRef<HTMLCanvasElement>;

  // Inputs
  readonly labels = input.required<string[]>();
  readonly datasets = input.required<GroupedBarDataset[]>();
  readonly height = input(220);
  readonly currency = input(true);
  readonly currencyCode = input('NGN');
  readonly locale = input('en-NG');
  readonly ariaLabel = input('Grouped bar chart');

  private chart?: Chart<'bar'>;
  private viewReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.render();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.viewReady) {
      this.render();
    }
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

    // Fallback colour palette (if dataset doesn't provide its own)
    const fallbackColors = [
      this.cssVar(style, '--wf-success', '#16833b'),
      this.cssVar(style, '--wf-primary', '#0f9d58'),
      this.cssVar(style, '--wf-warning', '#f29900'),
      this.cssVar(style, '--wf-danger', '#dc3545'),
      this.cssVar(style, '--wf-purple', '#6f42c1'),
    ];

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return {
      type: 'bar',
      data: {
        labels: this.labels(),
        datasets: this.datasets().map((dataset) => ({
          label: dataset.label,
          data: dataset.data,
          // Use the provided backgroundColor (array or string), else fallback
          backgroundColor: dataset.backgroundColor ?? fallbackColors,
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.68,
          categoryPercentage: 0.62,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: reduceMotion
          ? false
          : { duration: 650, easing: 'easeOutCubic' },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => {
                const value = Number(item.raw ?? 0);
                return `${item.dataset.label}: ${this.formatValue(value)}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: textMuted,
              font: { size: 11, weight: 600 },
            },
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
    const formatter = new Intl.NumberFormat(
      this.locale(),
      this.currency()
        ? {
          style: 'currency',
          currency: this.currencyCode(),
          notation: 'compact',
          maximumFractionDigits: 1,
        }
        : {
          notation: 'compact',
          maximumFractionDigits: 1,
        }
    );
    const result = formatter.format(value);
    if (this.currency() && this.currencyCode() === 'NGN') {
      return result.replace('NGN', '₦');
    }
    return result;
  }

  private cssVar(style: CSSStyleDeclaration, name: string, fallback: string): string {
    return style.getPropertyValue(name).trim() || fallback;
  }
}
