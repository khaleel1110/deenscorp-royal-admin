import {Component, inject, Input, TemplateRef} from '@angular/core';

import { NgbDatepickerModule, NgbOffcanvas, OffcanvasDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import {RouterLink, RouterLinkActive} from "@angular/router";
import {NgClass} from "@angular/common";
import {NavigationType} from "../models/navigation-type.model";
import { environment } from '../../../../environments/environment';



@Component({
  selector: 'yex-menu',
  standalone: true,
  imports: [NgbDatepickerModule, RouterLink, RouterLinkActive, NgClass],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {

  private offcanvasService = inject(NgbOffcanvas);
  closeResult = '';

  open(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { ariaLabelledBy: 'offcanvas-basic-title' }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      },
    );


  }

  close(){
    this.offcanvasService.dismiss('ghgjjh')
  }

  private getDismissReason(reason: any): string {
    switch (reason) {
      case OffcanvasDismissReasons.ESC:
        return 'by pressing ESC';
      case OffcanvasDismissReasons.BACKDROP_CLICK:
        return 'by clicking on the backdrop';
      default:
        return `with: ${reason}`;
    }
  }

  protected readonly env = environment;
@Input() mainNavigation:NavigationType[] =[];

}
