import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { SkeletonComponent } from '../skeleton/skeleton.component';

export interface DonutItem {
  label: string;
  value: string | number;
  color: string;
}

@Component({
  selector: 'app-donut-chart',

  standalone: true,

  imports: [SkeletonComponent],

  template: `
    <div class="donut-wrap">
      @if (loading()) {
        <!-- Donut skeleton -->
        <app-skeleton shape="circle" width="152px" height="152px" ariaLabel="Loading chart" />
      } @else {
        <!-- Donut -->
        <div class="donut" aria-hidden="true">
          <div class="donut-center">
            <strong>
              {{ total() }}
            </strong>

            <span class="small-muted">
              {{ caption() }}
            </span>
          </div>
        </div>
      }

      <!-- Legend -->
      <div class="chart-legend">
        @if (loading()) {
          @for (row of [0, 1, 2, 3]; track row) {
            <div class="legend-row">
              <app-skeleton shape="circle" width="8px" height="8px" />

              <app-skeleton shape="line" width="72%" />

              <app-skeleton shape="line" width="54px" />
            </div>
          }
        } @else {
          @for (item of items(); track item.label) {
            <div class="legend-row">
              <span class="legend-dot" [style.--dot-color]="item.color"></span>

              <span>
                {{ item.label }}
              </span>

              <strong>
                {{ item.value }}
              </strong>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [
    `
      .donut-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 2.5rem;
        min-height: 180px;
      }


      // ------------------------------------
      // Donut
      // ------------------------------------

      .donut {
        position: relative;

        width: 152px;
        height: 152px;

        flex: 0 0 152px;

        border-radius: 50%;

        background:
          conic-gradient(
            var(--donut-primary) 0 42%,
            var(--donut-success) 42% 72%,
            var(--donut-warning) 72% 90%,
            var(--donut-danger) 90% 100%
          );

        display: flex;
        align-items: center;
        justify-content: center;
      }


      // Inner circle

      .donut::before {
        content: '';

        position: absolute;

        width: 108px;
        height: 108px;

        border-radius: 50%;

        background: var(--bs-body-bg);
      }


      // Center

      .donut-center {
        position: relative;
        z-index: 1;

        display: flex;
        flex-direction: column;
        align-items: center;

        text-align: center;
      }

      .donut-center strong {
        font-size: 1.5rem;
        font-weight: 700;

        color: var(--bs-heading-color);
      }

      .donut-center .small-muted {
        font-size: 0.75rem;
      }


      // ------------------------------------
      // Legend
      // ------------------------------------

      .chart-legend {
        display: flex;
        flex-direction: column;

        gap: 0.75rem;

        min-width: 180px;
      }

      .legend-row {
        display: grid;

        grid-template-columns:
    8px
    1fr
    auto;

        align-items: center;

        gap: 0.6rem;

        color: var(--bs-body-color);

        font-size: 0.8125rem;
      }

      .legend-dot {
        width: 8px;
        height: 8px;

        border-radius: 50%;

        background: var(--dot-color);
      }

      .legend-row strong {
        font-weight: 600;
      }


      // ------------------------------------
      // Mobile
      // ------------------------------------

      @media (max-width: 575.98px) {

        .donut-wrap {
          flex-direction: column;

          gap: 1.5rem;
        }

        .chart-legend {
          width: 100%;
        }

      }
    `,
  ],

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonutChartComponent {
  readonly total = input.required<string | number>();

  readonly caption = input('Total');

  readonly items = input.required<DonutItem[]>();

  readonly loading = input(false);
}
