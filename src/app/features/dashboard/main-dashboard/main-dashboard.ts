import { Component, inject } from '@angular/core';

import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

import { toSignal } from '@angular/core/rxjs-interop';
import { CourseService } from '../../../services/domain/course';
import {CourseCategory} from "../../../services/domain/course-category";
import {JsonPipe} from "@angular/common";



@Component({
  selector: 'app-main-dashboard',
  imports: [JsonPipe],
  templateUrl: './main-dashboard.html',
  styleUrl: './main-dashboard.scss',
})
export class MainDashboard {
  constructor() {


    this.courseService.courses$.subscribe((courses) => {
      console.log(courses);
    });

    setTimeout(() => {

      console.log('Signal Courses', this.course());
    }, 3000);
  }

  private offcanvasService = inject(NgbOffcanvas);
  private courseService = inject(CourseService);
  private courseCategoryService = inject(CourseCategory);

  // Signals from Firestore
  course = toSignal(this.courseService.courses$, { initialValue: [] });
}
