import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-dashboard-stat',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-stat.html',
  styleUrl: './dashboard-stat.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardStat {
  readonly label = input.required<string>();

  readonly value = input.required<string>();

  readonly icon = input('bi-grid');

  readonly tone = input<'primary' | 'success' | 'warning' | 'danger' | 'purple' | ''>('');

  readonly helper = input('');

  readonly trend = input('');

  readonly trendDown = input(false);

  readonly loading = input(false);
}
