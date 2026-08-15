import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('../features/dashboard/main-dashboard/main-dashboard').then((m) => m.MainDashboard),
  },

  {
    path: 'course-dashboard',
    loadComponent: () =>
      import('../features/course/course-dashboard/course-dashboard').then((m) => m.CourseDashboard),
  },

  {
    path: 'course-list',
    loadComponent: () =>
      import('../features/course/course-list/course-list').then((m) => m.CourseList),
  },

  {
    path: 'view-course/:id',
    loadComponent: () =>
      import('../features/course/view-course/view-course').then((m) => m.ViewCourse),
  },
  {
    path: 'view-venues/:id',
    loadComponent: () =>
      import('../features/training-venue/venue-view/venue-view').then((m) => m.VenueView),
  },
  {
    path: 'venue-list',
    loadComponent: () =>
      import('../features/training-venue/venue-list/venue-list').then((m) => m.VenueList),
  },
  {
    path: 'venue-dashboard',
    loadComponent: () =>
      import('../features/training-venue/training-dashboard/training-dashboard').then((m) => m.TrainingDashboard),
  }, {
    path: 'featured-dashboard',
    loadComponent: () =>
      import('../features/featured-course/featured-course-dashboard/featured-course-dashboard').then((m) => m.FeaturedCourseDashboard),
  }, {
    path: 'featured-list',
    loadComponent: () =>
      import('../features/featured-course/featured-course-list/featured-course-list').then((m) => m.FeaturedCourseList),
  },

  {
    path: '**',
    redirectTo: 'course-list',
  },
];
