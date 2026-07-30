import {Component, effect, inject} from '@angular/core';
import {ToastService} from "../toast.service";
import {NgbToast} from "@ng-bootstrap/ng-bootstrap";
import {DecimalPipe, NgClass} from "@angular/common";


@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [
    NgbToast,
    NgClass,
  ],
  template: `
      @for (toast of toastService.toasts;track toast) {
          <div class="my-2 window-class2">
              <ngb-toast
                      [ngClass]="toast.type === 'success'?'bg-success text-light':toast.type ==='danger'?'bg-danger  text-light':''"
                      [autohide]="true" [delay]="toast.delay || 5000"
                      (hidden)="toastService.remove(toast)"
              >
               <!-- {{toast.header}}
                <br/>-->
                {{ toast.body }}
              </ngb-toast>
          </div>
      }



  `,
  styles: `

  :host {
  position: fixed;
  top: 0;
  right: 0;
  margin: 0.5em;
  z-index: 1200;
}

`
})
export class ToastNotificationComponent {


  constructor(public toastService: ToastService) {

  }
}
