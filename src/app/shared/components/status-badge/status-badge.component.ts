import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

function statusTone(s: string) {
  return undefined;
}

@Component({
  selector: 'app-status-badge',

  template: `
    <span class="badge" [class]="'badge status-' + tone()">
      {{ status() }}
    </span>
  `,

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  readonly status = input.required<string>();

  readonly tone = computed(() => statusTone(this.status()));
}
