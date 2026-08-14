import { Injectable, inject } from '@angular/core';
import { combineLatest, map, shareReplay } from 'rxjs';

import { CourseService } from './course';
import { CourseCategoryService } from './course-category';
import { TrainingVenueService } from './program-venue';

export interface HomeStat {
  title: string;
  value: number;
  max: number;
  color: string;
  prefix?: string;
  suffix?: string;
}

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private readonly courseService = inject(CourseService);
  private readonly categoryService = inject(CourseCategoryService);
  private readonly venueService = inject(TrainingVenueService);

  readonly stats$ = combineLatest({
    courses: this.courseService.getAll(),
    categories: this.categoryService.getAll(),
    venues: this.venueService.getAll(),
  }).pipe(
    map(({ courses, categories, venues }): HomeStat[] => {
      const activeCourses = courses.filter((c) => c.isActive).length;

      const activeCategories = categories.filter((c) => c.isActive).length;

      const activeVenues = venues.filter((v) => v.isActive).length;

      return [
        {
          title: 'Professional Courses',
          value: activeCourses,
          max: Math.max(activeCourses, 20),
          color: '#377dff',
        },

        {
          title: 'Training Venues',
          value: activeVenues,
          max: Math.max(activeVenues, 20),
          color: '#f5a623',
        },

        {
          title: 'Corporate Clients',
          value: 100,
          max: 200,
          suffix: '+',
          color: '#e74c3c',
        },

        {
          title: 'Professionals Trained',
          value: 500,
          max: 800,
          suffix: '+',
          color: '#427dc1',
        },
      ];
    }),

    shareReplay({
      bufferSize: 1,
      refCount: true,
    }),
  );
}
