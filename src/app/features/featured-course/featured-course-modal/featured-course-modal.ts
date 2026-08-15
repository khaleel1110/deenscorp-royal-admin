import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Storage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from '@angular/fire/storage';

import {
  FeaturedCourse,
  FeaturedCourseFormInput,
  FeaturedCourseService,
} from '../../../services/domain/featured-course';
import { Course, CourseService } from '../../../services/domain/course';

const BADGE_COLORS = [
  { value: 'success', label: 'Bestseller (green)' },
  { value: 'warning', label: 'Popular (yellow)' },
  { value: 'primary', label: 'New (primary)' },
  { value: 'danger', label: 'Limited Seats (red)' },
  { value: 'secondary', label: 'Standard (grey)' },
];

@Component({
  selector: 'app-featured-course-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './featured-course-modal.html',
  styleUrl: './featured-course-modal.scss',
})
export class FeaturedCourseModal implements OnInit {
  @Input() item?: FeaturedCourse;

  readonly activeModal = inject(NgbActiveModal);
  private readonly fb = inject(FormBuilder);
  private readonly featuredCourseService = inject(FeaturedCourseService);
  private readonly courseService = inject(CourseService);
  private readonly storage = inject(Storage);

  readonly badgeColors = BADGE_COLORS;

  readonly courses = toSignal(this.courseService.getAll(), { initialValue: [] as Course[] });

  form!: FormGroup;

  imagePreview: string | null = null;
  private uploadedImagePath: string | null = null;

  readonly saving = signal(false);
  readonly error = signal('');
  readonly uploading = signal(false);
  readonly uploadProgress = signal(0);
  readonly uploadError = signal('');

  get isEdit(): boolean {
    return !!this.item;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      title: [this.item?.title ?? '', Validators.required],
      category: [this.item?.category ?? '', Validators.required],
      badge: [this.item?.badge ?? 'Popular'],
      badgeColor: [this.item?.badgeColor ?? 'primary'],
      image: [this.item?.image ?? '', Validators.required],
      rating: [this.item?.rating ?? 4.5, [Validators.min(0), Validators.max(5)]],
      reviewCount: [this.item?.reviewCount ?? 0, [Validators.min(0)]],
      lessons: [this.item?.lessons ?? 0, [Validators.min(0)]],
      duration: [this.item?.duration ?? ''],
      originalPrice: [this.item?.originalPrice ?? 0, [Validators.min(0)]],
      currentPrice: [this.item?.currentPrice ?? 0, [Validators.min(0)]],
      currency: [this.item?.currency ?? 'USD'],
      previewUrl: [this.item?.previewUrl ?? '', Validators.required],
      courseId: [this.item?.courseId ?? ''],
      displayOrder: [this.item?.displayOrder ?? 0],
      isActive: [this.item?.isActive ?? true],
    });

    this.imagePreview = this.item?.image || null;
  }

  /** Convenience: pick a real course to prefill title/category/duration/link. */
  onPrefillCourseChange(courseId: string): void {
    if (!courseId) return;

    const course = this.courses().find((c) => c.id === courseId);
    if (!course) return;

    this.form.patchValue({
      courseId: course.id,
      title: this.form.get('title')?.value || course.name,
      duration: this.form.get('duration')?.value || course.duration,
      previewUrl: this.form.get('previewUrl')?.value || `/course/list/${course.id}`,
    });

    if (!this.form.get('image')?.value && course.thumbnail) {
      this.form.patchValue({ image: course.thumbnail });
      this.imagePreview = course.thumbnail;
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.uploadError.set('Image must be under 5MB.');
      return;
    }

    this.uploadError.set('');
    this.uploading.set(true);
    this.uploadProgress.set(0);

    const path = `featured-courses/${Date.now()}-${file.name}`;
    const fileRef = storageRef(this.storage, path);
    const task = uploadBytesResumable(fileRef, file);

    task.on(
      'state_changed',
      (snapshot) => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        this.uploadProgress.set(pct);
      },
      (error) => {
        console.error('Upload failed:', error);
        this.uploadError.set('Upload failed. Please try again.');
        this.uploading.set(false);
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        this.form.patchValue({ image: url });
        this.imagePreview = url;
        this.uploadedImagePath = path;
        this.uploading.set(false);
      },
    );

    input.value = '';
  }

  async removeImage(): Promise<void> {
    if (this.uploadedImagePath) {
      try {
        await deleteObject(storageRef(this.storage, this.uploadedImagePath));
      } catch {
        // Non-fatal — the doc reference is what matters most.
      }
      this.uploadedImagePath = null;
    }

    this.imagePreview = null;
    this.form.patchValue({ image: '' });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');

    try {
      const input: FeaturedCourseFormInput = this.form.value;

      if (this.isEdit && this.item) {
        await this.featuredCourseService.update(this.item.id, input);
      } else {
        await this.featuredCourseService.create(input);
      }

      this.activeModal.close(true);
    } catch (err: any) {
      console.error('Failed to save featured course:', err);
      this.error.set(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.activeModal.dismiss();
  }
}
