import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { toSignal } from '@angular/core/rxjs-interop';

import { DashboardStat } from '../../dashboard/main-dashboard/dashboard-stat/dashboard-stat';
import { PageFooterComponent } from '../../../shared/components/page-footer/page-footer.component';

import { Course, CourseService } from '../../../services/domain/course';
import { CourseCategory, CourseCategoryService } from '../../../services/domain/course-category';
import { TrainingVenue, TrainingVenueService } from '../../../services/domain/program-venue';
import {CourseCategoryModal} from './course-category-modal';
import {CourseModal} from './course-modal';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DashboardStat,
    PageFooterComponent,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdownItem,
  ],
  templateUrl: './course-list.html',
  styleUrl: './course-list.scss',
})
export class CourseList {
  private readonly courseService = inject(CourseService);
  private readonly categoryService = inject(CourseCategoryService);
  private readonly venueService = inject(TrainingVenueService);
  private readonly modalService = inject(NgbModal);

  // ─── Data ──────────────────────────────────────────────────
  readonly courses = toSignal(this.courseService.courses$, { initialValue: [] as Course[] });
  readonly categories = toSignal(this.categoryService.categories$, {
    initialValue: [] as CourseCategory[],
  });
  readonly venues = toSignal(this.venueService.venues$, { initialValue: [] as TrainingVenue[] });
  readonly isLoading = toSignal(this.courseService.isLoading$, { initialValue: true });

  // ─── Filters ───────────────────────────────────────────────
  readonly query = signal('');
  readonly selectedCategoryId = signal<string>('');
  readonly selectedLevel = signal<string>('');
  readonly selectedDeliveryMode = signal<string>('');
  readonly selectedStatus = signal<string>('');

  // ─── Filtered list ─────────────────────────────────────────
  readonly filteredCourses = computed(() => {
    const q = this.query().trim().toLowerCase();
    const categoryId = this.selectedCategoryId();
    const level = this.selectedLevel();
    const mode = this.selectedDeliveryMode();
    const status = this.selectedStatus();

    return this.courses().filter((course) => {
      const matchesQuery =
        !q ||
        course.name.toLowerCase().includes(q) ||
        course.code.toLowerCase().includes(q) ||
        course.shortDescription.toLowerCase().includes(q) ||
        (course.tags ?? []).some((t) => t.toLowerCase().includes(q));

      const matchesCategory = !categoryId || course.categoryId === categoryId;
      const matchesLevel = !level || course.level === level;
      const matchesMode = !mode || (course.deliveryModes ?? []).includes(mode as any);
      const matchesStatus = !status || (status === 'active' ? course.isActive : !course.isActive);

      return matchesQuery && matchesCategory && matchesLevel && matchesMode && matchesStatus;
    });
  });

  // ─── Simple pagination ─────────────────────────────────────
  readonly pageSize = 10;
  readonly page = signal(1);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredCourses().length / this.pageSize)),
  );

  readonly pagedCourses = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredCourses().slice(start, start + this.pageSize);
  });

  readonly rangeStart = computed(() =>
    this.filteredCourses().length === 0 ? 0 : (this.page() - 1) * this.pageSize + 1,
  );

  readonly rangeEnd = computed(() =>
    Math.min(this.page() * this.pageSize, this.filteredCourses().length),
  );

  // ─── Stats ─────────────────────────────────────────────────
  readonly totalCourses = computed(() => this.courses().length);
  readonly activeCourses = computed(() => this.courses().filter((c) => c.isActive).length);
  readonly featuredCourses = computed(() => this.courses().filter((c) => c.featured).length);
  readonly totalCategories = computed(() => this.categories().length);

  // ─── Helpers ───────────────────────────────────────────────
  categoryName(categoryId: string): string {
    return this.categories().find((c) => c.id === categoryId)?.name ?? 'Uncategorized';
  }

  courseCountFor(categoryId: string): number {
    return this.courses().filter((c) => c.categoryId === categoryId).length;
  }

  updateSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.page.set(1);
  }

  clearFilters(): void {
    this.query.set('');
    this.selectedCategoryId.set('');
    this.selectedLevel.set('');
    this.selectedDeliveryMode.set('');
    this.selectedStatus.set('');
    this.page.set(1);
  }

  previousPage(): void {
    if (this.page() > 1) this.page.set(this.page() - 1);
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) this.page.set(this.page() + 1);
  }

  // ─── Modals ────────────────────────────────────────────────
/*  openAddCategoryModal(): void {
    this.modalService.open(CourseCategoryModal, { size: 'md' });
  }*/

/*
  openEditCategoryModal(category: CourseCategory): void {
    const ref = this.modalService.open(CourseCategoryModal, { size: 'md' });
    ref.componentInstance.category = category;
  }

  openAddCourseModal(): void {
    this.modalService.open(CourseModal, { size: 'lg' });
  }

  openEditCourseModal(course: Course): void {
    const ref = this.modalService.open(CourseModal, { size: 'lg' });
    ref.componentInstance.course = course;
  }

  async deleteCourse(course: Course): Promise<void> {
    if (!confirm(`Delete "${course.name}"? This cannot be undone.`)) {
      return;
    }
    await this.courseService.delete(course.id);
  }

  async deleteCategory(category: CourseCategory): Promise<void> {
    const courseCount = this.courseCountFor(category.id);

    const message = courseCount > 0
        ? `The category "${category.name}" has ${courseCount} course${
            courseCount === 1 ? '' : 's'
        } assigned to it.\n\nAre you sure you want to delete this category?`
        : `Are you sure you want to delete "${category.name}"?\n\nThis action cannot be undone.`;

    const confirmed = window.confirm(message);

    if (!confirmed) {
      return;
    }

    try {
      await this.categoryService.delete(category.id);
    } catch (error) {
      console.error('Failed to delete category:', error);

      alert('Failed to delete the category. Please try again.');
    }
  }

*/














  // ─── Modals ────────────────────────────────────────────────

  openAddCategoryModal(): void {
    this.modalService.open(CourseCategoryModal, { size: 'md' });
  }

  openEditCategoryModal(category: CourseCategory): void {
    const ref = this.modalService.open(CourseCategoryModal, { size: 'md' });
    ref.componentInstance.category = category;
  }

  openAddCourseModal(): void {
    this.modalService.open(CourseModal, { size: 'lg' });
  }

  openEditCourseModal(course: Course): void {
    const ref = this.modalService.open(CourseModal, { size: 'lg' });
    ref.componentInstance.course = course;
  }


// ─── Delete Category ──────────────────────────────────────

  async deleteCategory(category: CourseCategory): Promise<void> {
    const courseCount = this.courseCountFor(category.id);

    const message = courseCount > 0
        ? `The category "${category.name}" has ${courseCount} course${
            courseCount === 1 ? '' : 's'
        } assigned to it.\n\nAre you sure you want to delete this category?`
        : `Are you sure you want to delete "${category.name}"?\n\nThis action cannot be undone.`;

    const confirmed = window.confirm(message);

    if (!confirmed) {
      return;
    }

    try {
      await this.categoryService.delete(category.id);
    } catch (error) {
      console.error('Failed to delete category:', error);

      alert('Failed to delete the category. Please try again.');
    }
  }


// ─── Delete Course ────────────────────────────────────────

  async deleteCourse(course: Course): Promise<void> {
    if (!confirm(`Delete "${course.name}"? This cannot be undone.`)) {
      return;
    }

    await this.courseService.delete(course.id);
  }
}
