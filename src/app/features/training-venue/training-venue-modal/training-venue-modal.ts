import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';

import {
  TrainingVenue,
  TrainingVenueService,
  VenueFormInput,
} from '../../../services/domain/program-venue';
import { FileStorageService } from '../../../services/domain/file-storage.service';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

@Component({
  selector: 'app-training-venue-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './training-venue-modal.html',
  styleUrl: './training-venue-modal.scss',
})
export class TrainingVenueModal implements OnInit {
  @Input() venue?: TrainingVenue;

  private readonly fb = inject(FormBuilder);
  private readonly venueService = inject(TrainingVenueService);
  private readonly fileStorage = inject(FileStorageService);
  readonly activeModal = inject(NgbActiveModal);

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly facilities = signal<string[]>([]);
  newFacility = '';

  readonly uploading = signal(false);
  readonly uploadProgress = signal(0);
  readonly uploadError = signal<string | null>(null);

  private originalImageUrl: string | null = null;
  private lastSelfUploadedUrl: string | null = null;

  get isEdit(): boolean {
    return !!this.venue;
  }

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    city: ['', Validators.required],
    state: [''],
    country: ['', Validators.required],
    address: [''],
    postcode: [''],
    latitude: [null as number | null],
    longitude: [null as number | null],
    timezone: [''],
    contactEmail: ['', Validators.email],
    contactPhone: [''],
    website: [''],
    image: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    if (this.venue) {
      this.form.patchValue({
        name: this.venue.name,
        city: this.venue.city,
        state: this.venue.state,
        country: this.venue.country,
        address: this.venue.address,
        postcode: this.venue.postcode,
        latitude: this.venue.latitude ?? null,
        longitude: this.venue.longitude ?? null,
        timezone: this.venue.timezone,
        contactEmail: this.venue.contactEmail,
        contactPhone: this.venue.contactPhone,
        website: this.venue.website,
        image: this.venue.image,
        isActive: this.venue.isActive,
      });
      this.facilities.set([...(this.venue.facilities ?? [])]);
      this.originalImageUrl = this.venue.image || null;
    }
  }

  get imagePreview(): string | null {
    return this.form.get('image')?.value || null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // lets the same file be re-selected later if removed

    if (!file) return;

    this.uploadError.set(null);

    if (!file.type.startsWith('image/')) {
      this.uploadError.set('Please choose an image file (JPG, PNG, WebP…).');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      this.uploadError.set('Image is too large — please choose a file under 5MB.');
      return;
    }

    const path = this.fileStorage.buildVenueImagePath(this.venue?.id, file);
    this.uploading.set(true);
    this.uploadProgress.set(0);

    this.fileStorage
      .upload(path, file)
      .pipe(finalize(() => this.uploading.set(false)))
      .subscribe({
        next: ({ progress, downloadURL }) => {
          this.uploadProgress.set(progress);

          if (downloadURL) {
            // The previous self-uploaded file (this session only) is now
            // orphaned — safe to delete immediately.
            if (this.lastSelfUploadedUrl) {
              this.fileStorage.deleteByUrl(this.lastSelfUploadedUrl);
            }
            this.lastSelfUploadedUrl = downloadURL;
            this.form.patchValue({ image: downloadURL });
          }
        },
        error: (err) => {
          console.error('Image upload failed:', err);
          this.uploadError.set('Upload failed. Please try again.');
        },
      });
  }

  removeImage(): void {
    if (this.lastSelfUploadedUrl) {
      this.fileStorage.deleteByUrl(this.lastSelfUploadedUrl);
      this.lastSelfUploadedUrl = null;
    }
    this.form.patchValue({ image: '' });
    this.uploadError.set(null);
  }

  addFacility(): void {
    const value = this.newFacility.trim();
    if (!value) return;
    if (!this.facilities().includes(value)) {
      this.facilities.update((list) => [...list, value]);
    }
    this.newFacility = '';
  }

  removeFacility(index: number): void {
    this.facilities.update((list) => list.filter((_, i) => i !== index));
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.uploading()) {
      this.error.set('Please wait for the image to finish uploading.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const raw = this.form.getRawValue();
    const payload: VenueFormInput = {
      name: raw.name!.trim(),
      city: raw.city!.trim(),
      state: (raw.state ?? '').trim(),
      country: raw.country!.trim(),
      address: (raw.address ?? '').trim(),
      postcode: (raw.postcode ?? '').trim(),
      latitude: raw.latitude ?? 0,
      longitude: raw.longitude ?? 0,
      timezone: (raw.timezone ?? '').trim(),
      contactEmail: (raw.contactEmail ?? '').trim(),
      contactPhone: (raw.contactPhone ?? '').trim(),
      website: (raw.website ?? '').trim(),
      image: (raw.image ?? '').trim(),
      facilities: this.facilities(),
      isActive: raw.isActive ?? true,
    };

    try {
      if (this.isEdit && this.venue) {
        await this.venueService.update(this.venue.id, payload);
      } else {
        await this.venueService.create(payload);
      }

      // Only now — after the new image is safely persisted — clean up
      // the old one, if it was replaced or removed.
      if (this.originalImageUrl && this.originalImageUrl !== payload.image) {
        this.fileStorage.deleteByUrl(this.originalImageUrl);
      }

      this.activeModal.close(true);
    } catch (err) {
      console.error('Failed to save venue:', err);
      this.error.set('Failed to save the venue. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.activeModal.dismiss();
  }
}
