import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-page-footer',
  template: `<footer class="app-footer">
    <span>2026 Deenscorp Royal . Trademark of YDeenscorp Royal. All rights reserved.</span
    ><span class="d-flex gap-4"
      ><a href="#">Privacy policy</a><a href="#">Terms of service</a><a href="#">Help</a></span
    >
  </footer>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageFooterComponent {}
