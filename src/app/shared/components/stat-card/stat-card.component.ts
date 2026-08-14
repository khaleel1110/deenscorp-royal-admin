import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SkeletonComponent } from '../skeleton/skeleton.component';

@Component({
  selector: 'app-stat-card',
  imports: [SkeletonComponent],
  template: `
    <article class="stat-card h-100">
      <div class="stat-card-top">
        <div>
          <div class="small-muted mb-2">{{ label() }}</div>
          @if (loading()) {
            <app-skeleton shape="metric" width="96px" height="30px" [ariaLabel]="'Loading ' + label()" />
            <app-skeleton shape="line" width="72%" height="10px" />
          } @else {
            <div class="metric-value">{{ value() }}</div>
            @if (helper()) { <div class="small-muted mt-1">{{ helper() }}</div> }
          }
        </div>
        <span class="stat-icon" [class]="'stat-icon ' + tone()"><i [class]="'bi ' + icon()"></i></span>
      </div>
      @if (loading()) {
        <app-skeleton shape="pill" width="88px" height="22px" />
      } @else if (trend()) {
        <span class="trend" [class.down]="trendDown()">
          <i [class]="trendDown() ? 'bi bi-arrow-down' : 'bi bi-arrow-up'"></i>
          {{ trend() }}
        </span>
      }
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly icon = input('bi-grid');
  readonly tone = input<'success' | 'warning' | 'danger' | 'purple' | ''>('');
  readonly helper = input('');
  readonly trend = input('');
  readonly trendDown = input(false);
  readonly loading = input(false);
}
