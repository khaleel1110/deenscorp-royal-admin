import { ChangeDetectionStrategy, Component, HostBinding, input } from '@angular/core';

export type SkeletonShape = 'line' | 'block' | 'circle' | 'pill' | 'metric' | 'avatar';

@Component({
  selector: 'app-skeleton',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComponent {
  readonly shape = input<SkeletonShape>('line');
  readonly width = input<string | number>('100%');
  readonly height = input<string | number>('');
  readonly ariaLabel = input('Loading content');

  @HostBinding('class') get classes(): string { return `wf-skeleton wf-skeleton-${this.shape()}`; }
  @HostBinding('attr.role') readonly role = 'status';
  @HostBinding('attr.aria-live') readonly ariaLive = 'polite';
  @HostBinding('attr.aria-label') get label(): string { return this.ariaLabel(); }
  @HostBinding('style.width') get skeletonWidth(): string { return this.size(this.width()); }
  @HostBinding('style.height') get skeletonHeight(): string | null {
    const height = this.height();
    return height === '' ? null : this.size(height);
  }

  private size(value: string | number): string {
    return typeof value === 'number' ? `${value}px` : value;
  }
}
