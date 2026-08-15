import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { toSignal } from '@angular/core/rxjs-interop';

import { FeaturedCourseModal } from '../featured-course-modal/featured-course-modal';
import {
  FeaturedCourse,
  FeaturedCourseService,
} from '../../../services/domain/featured-course';

@Component({
  selector: 'app-featured-course-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgbDropdownModule],
  templateUrl: './featured-course-list.html',
  styleUrl: './featured-course-list.scss',
})
export class FeaturedCourseList {
  private readonly featuredCourseService = inject(FeaturedCourseService);
  private readonly modalService = inject(NgbModal);

  readonly items = toSignal(this.featuredCourseService.allFeaturedCourses$, {
    initialValue: [] as FeaturedCourse[],
  });

  searchTerm = '';

  get filteredItems(): FeaturedCourse[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.items();
    return this.items().filter(
      (i) =>
        i.title.toLowerCase().includes(term) ||
        i.category.toLowerCase().includes(term) ||
        i.badge.toLowerCase().includes(term),
    );
  }

  openAddModal(): void {
    this.modalService.open(FeaturedCourseModal, { size: 'lg', backdrop: 'static' });
  }

  openEditModal(item: FeaturedCourse): void {
    const ref = this.modalService.open(FeaturedCourseModal, { size: 'lg', backdrop: 'static' });
    ref.componentInstance.item = item;
  }

  async toggleActive(item: FeaturedCourse): Promise<void> {
    try {
      await this.featuredCourseService.setActive(item.id, !item.isActive);
    } catch (error) {
      console.error('Failed to update featured course status:', error);
      alert('Failed to update. Please try again.');
    }
  }

  async deleteItem(item: FeaturedCourse): Promise<void> {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.title}"?\n\nThis action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await this.featuredCourseService.delete(item.id);
    } catch (error) {
      console.error('Failed to delete featured course:', error);
      alert('Failed to delete. Please try again.');
    }
  }
}
