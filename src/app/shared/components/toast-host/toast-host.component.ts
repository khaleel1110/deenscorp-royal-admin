import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../../services/notification/toast.service';


@Component({
  selector: 'app-toast-host',
  template: `
<!--    <div class="toast-container" aria-live="polite" aria-atomic="true">
      @for (toast of toasts.messages(); track toast.id) {
        <div class="wf-toast" @toastMotion>
          <span class="stat-icon {{ toast.tone === 'danger' ? 'danger' : toast.tone === 'warning' ? 'warning' : toast.tone === 'success' ? 'success' : '' }}">
            <i class="bi" [class.bi-check-lg]="toast.tone === 'success'" [class.bi-info-lg]="toast.tone === 'info'" [class.bi-exclamation-triangle]="toast.tone === 'warning' || toast.tone === 'danger'"></i>
          </span>
          <div class="flex-grow-1"><strong class="d-block">{{ toast.title }}</strong><span class="small-muted">{{ toast.message }}</span></div>
          <button class="btn-close" type="button" aria-label="Dismiss" (click)="toasts.dismiss(toast.id)"></button>
        </div>
      }
    </div>-->
  `,

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastHostComponent {

  readonly toasts = inject(ToastService); }
