import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SkeletonComponent } from './skeleton.component';

@Component({
  selector: 'tbody[appSkeletonRows]',
  imports: [SkeletonComponent],
  template: `
    @for (row of rowIndexes(); track row) {
      <tr class="skeleton-table-row" aria-hidden="true">
        @for (column of columnIndexes(); track column) {
          <td>
            @if (checkboxColumn() && column === 0) {
              <app-skeleton shape="circle" width="16px" height="16px" />
            } @else if (avatarColumns().includes(column)) {
              <span class="skeleton-cell-stack">
                <app-skeleton shape="avatar" width="30px" height="30px" />
                <span class="skeleton-copy">
                  <app-skeleton shape="line" [width]="lineWidth(row, column)" />
                  <app-skeleton shape="line" width="46%" height="8px" />
                </span>
              </span>
            } @else if (statusColumns().includes(column)) {
              <app-skeleton shape="pill" width="76px" height="22px" />
            } @else if (actionColumn() && column === columns() - 1) {
              <app-skeleton shape="pill" width="48px" height="30px" />
            } @else {
              <app-skeleton shape="line" [width]="lineWidth(row, column)" />
            }
          </td>
        }
      </tr>
    }
  `,
  host: {
    'class': 'wf-skeleton-tbody',
    'aria-busy': 'true',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonRowsComponent {
  readonly columns = input.required<number>();
  readonly rows = input(8);
  readonly avatarColumns = input<number[]>([]);
  readonly statusColumns = input<number[]>([]);
  readonly actionColumn = input(false);
  readonly checkboxColumn = input(false);

  readonly rowIndexes = computed(() => Array.from({ length: this.rows() }, (_, index) => index));
  readonly columnIndexes = computed(() => Array.from({ length: this.columns() }, (_, index) => index));

  lineWidth(row: number, column: number): string {
    const widths = ['82%', '64%', '74%', '54%', '88%', '46%', '70%'];
    return widths[(row + column) % widths.length];
  }
}
