import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CourseCategory, CourseCategoryService } from '../../../services/domain/course-category';

@Component({
  selector: 'app-course-category-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">{{ isEdit ? 'Edit Category' : 'Add Course Category' }}</h4>
      <button
        type="button"
        class="btn-close"
        aria-label="Close"
        (click)="activeModal.dismiss()">
      </button>
    </div>

    <div class="modal-body">
      <form [formGroup]="form">

        <div class="mb-3">
          <label class="form-label">Category Name *</label>
          <input
            class="form-control"
            formControlName="name"
            placeholder="e.g. Digital Technologies"
            [class.is-invalid]="form.get('name')?.invalid && form.get('name')?.touched">

          @if (form.get('name')?.errors?.['required']) {
            <div class="invalid-feedback">Category name is required</div>
          }
          @if (form.get('name')?.errors?.['minlength']) {
            <div class="invalid-feedback">Category name must be at least 2 characters</div>
          }
        </div>

        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea
            class="form-control"
            rows="3"
            formControlName="description"
            placeholder="Optional description">
          </textarea>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Icon (bootstrap-icons name)</label>
            <input class="form-control" formControlName="icon" placeholder="e.g. computer">
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Color</label>
            <input class="form-control form-control-color" type="color" formControlName="color">
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Display Order</label>
            <input class="form-control" type="number" formControlName="displayOrder">
          </div>
          <div class="col-md-6 mb-3 d-flex flex-column justify-content-end">
            <div class="form-check form-switch mb-2">
              <input class="form-check-input" type="checkbox" formControlName="featured" id="cat-featured">
              <label class="form-check-label" for="cat-featured">Featured</label>
            </div>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" formControlName="isActive" id="cat-active">
              <label class="form-check-label" for="cat-active">Active</label>
            </div>
          </div>
        </div>

        @if (errorMessage) {
          <div class="alert alert-danger">{{ errorMessage }}</div>
        }

      </form>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="activeModal.dismiss()">
        Cancel
      </button>

      <button
        type="button"
        class="btn btn-primary"
        [disabled]="form.invalid || isSaving"
        (click)="save()">
        {{ isSaving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Save Category') }}
      </button>
    </div>
  `,
})
export class CourseCategoryModal implements OnInit {
  @Input() category?: CourseCategory;

  readonly activeModal = inject(NgbActiveModal);
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CourseCategoryService);

  form!: FormGroup;
  isSaving = false;
  errorMessage = '';

  get isEdit(): boolean {
    return !!this.category;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.category?.name ?? '', [Validators.required, Validators.minLength(2)]],
      description: [this.category?.description ?? ''],
      icon: [this.category?.icon ?? ''],
      color: [this.category?.color ?? '#29845A'],
      displayOrder: [this.category?.displayOrder ?? 0],
      featured: [this.category?.featured ?? false],
      isActive: [this.category?.isActive ?? true],
    });
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    try {
      if (this.isEdit && this.category) {
        await this.categoryService.update(this.category.id, this.form.value);
      } else {
        await this.categoryService.create(this.form.value);
      }

      this.activeModal.close(true);
    } catch (err: any) {
      this.errorMessage = err?.message ?? 'Something went wrong. Please try again.';
    } finally {
      this.isSaving = false;
    }
  }
}
