import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SkeletonComponent } from '../skeleton/skeleton.component';

export interface DonutItem { label: string; value: string | number; color: string; }

@Component({
  selector: 'app-donut-chart',
  imports: [SkeletonComponent],
  template: `
    <div class="donut-wrap">
      @if (loading()) {
        <app-skeleton shape="circle" width="152px" height="152px" ariaLabel="Loading chart" />
      } @else {
        <div class="donut" aria-hidden="true">
          <div class="donut-center"><strong>{{ total() }}</strong><span class="small-muted">{{ caption() }}</span></div>
        </div>
      }
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
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          }
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonutChartComponent {
  readonly total = input.required<string | number>();
  readonly caption = input('Total');
  readonly items = input.required<DonutItem[]>();
  readonly loading = input(false);
}
