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
      import('../features/dashboard/main-dashboard/main-dashboard')
        .then((m) => m.MainDashboard),
  },

  {
    path: 'course-dashboard',
    loadComponent: () =>
      import('../features/course/course-dashboard/course-dashboard')
        .then((m) => m.CourseDashboard),
  },

  {
    path: 'course-list',
    loadComponent: () =>
      import('../features/course/course-list/course-list')
        .then((m) => m.CourseList),
  },

  {
    path: 'view-course/:id',
    loadComponent: () =>
      import('../features/course/view-course/view-course')
        .then((m) => m.ViewCourse),
  },

  {
    path: '**',
    redirectTo: 'course-list',
  },
];
