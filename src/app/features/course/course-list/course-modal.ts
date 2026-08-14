import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { toSignal } from '@angular/core/rxjs-interop';

import { Course, CourseFormInput, CourseService } from '../../../services/domain/course';
import { CourseCategoryService } from '../../../services/domain/course-category';
import { TrainingVenueService } from '../../../services/domain/program-venue';
import { CourseSessionService } from '../../../services/domain/course-session-service';

const DELIVERY_MODES = ['Classroom', 'Online', 'Virtual', 'Onsite'] as const;
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;

function toList(value: string): string[] {
  return value
    .split(/\r?\n|,/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function fromList(value?: string[]): string {
  return (value ?? []).join('\n');
}

@Component({
  selector: 'app-course-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">{{ isEdit ? 'Edit Course' : 'Add Course' }}</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">

      <div class="stepper mb-4">
        @for (label of steps; track label; let i = $index) {
          <div class="step" [class.active]="step() === i + 1" [class.done]="step() > i + 1">
            <span class="step-number">
              @if (step() > i + 1) { <i class="bi bi-check"></i> } @else { {{ i + 1 }} }
            </span>
            <span>{{ label }}</span>
          </div>
        }
      </div>

      <form [formGroup]="form">

        <!-- Step 1: Basic Info -->
        @if (step() === 1) {
          <div class="row g-3">
            <div class="col-md-8">
              <label class="form-label">Course Name *</label>
              <input class="form-control" formControlName="name" placeholder="e.g. Cybersecurity Fundamentals"
                     [class.is-invalid]="form.get('name')?.invalid && form.get('name')?.touched">
              @if (form.get('name')?.errors?.['required']) {
                <div class="invalid-feedback">Course name is required</div>
              }
            </div>
            <div class="col-md-4">
              <label class="form-label">Course Code *</label>
              <input class="form-control" formControlName="code" placeholder="e.g. DIG-003"
                     [class.is-invalid]="form.get('code')?.invalid && form.get('code')?.touched">
            </div>

            <div class="col-md-6">
              <label class="form-label">Category *</label>
              <select class="form-select" formControlName="categoryId"
                      [class.is-invalid]="form.get('categoryId')?.invalid && form.get('categoryId')?.touched">
                <option value="" disabled>Select a category</option>
                @for (category of categories(); track category.id) {
                  <option [value]="category.id">{{ category.name }}</option>
                }
              </select>
              @if (form.get('categoryId')?.errors?.['required']) {
                <div class="invalid-feedback">Category is required</div>
              }
            </div>

            <div class="col-md-3">
              <label class="form-label">Level</label>
              <select class="form-select" formControlName="level">
                @for (level of levels; track level) {
                  <option [value]="level">{{ level }}</option>
                }
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Language</label>
              <input class="form-control" formControlName="language" placeholder="English">
            </div>

            <div class="col-md-4">
              <label class="form-label">Duration</label>
              <input class="form-control" formControlName="duration" placeholder="e.g. 5 Days">
            </div>
            <div class="col-md-4">
              <label class="form-label">Accreditation</label>
              <input class="form-control" formControlName="accreditation" placeholder="e.g. LCT Certificate">
            </div>
            <div class="col-md-4 d-flex align-items-end">
              <div class="form-check form-switch me-4">
                <input class="form-check-input" type="checkbox" formControlName="certificate" id="course-cert">
                <label class="form-check-label" for="course-cert">Certificate</label>
              </div>
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" formControlName="featured" id="course-featured">
                <label class="form-check-label" for="course-featured">Featured</label>
              </div>
            </div>

            <div class="col-12">
              <label class="form-label">Short Description *</label>
              <textarea class="form-control" rows="2" formControlName="shortDescription"
                        placeholder="One or two sentences shown in listings"></textarea>
            </div>

            <div class="col-12">
              <label class="form-label">Delivery Modes</label>
              <div class="d-flex gap-3 flex-wrap">
                @for (mode of deliveryModes; track mode) {
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" [id]="'mode-' + mode"
                           [checked]="isModeSelected(mode)" (change)="toggleMode(mode)">
                    <label class="form-check-label" [for]="'mode-' + mode">{{ mode }}</label>
                  </div>
                }
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label">Tags (comma separated)</label>
              <input class="form-control" formControlName="tagsText" placeholder="e.g. Cyber, Security, Risk">
            </div>
            <div class="col-md-6">
              <label class="form-label">Industries (comma separated)</label>
              <input class="form-control" formControlName="industriesText" placeholder="e.g. Banking, Government">
            </div>
          </div>
        }

        <!-- Step 2: Details -->
        @if (step() === 2) {
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label">Overview</label>
              <textarea class="form-control" rows="3" formControlName="overview"
                        placeholder="Full course overview shown on the course page"></textarea>
            </div>
            <div class="col-md-6">
              <label class="form-label">Objectives <span class="small-muted">(one per line)</span></label>
              <textarea class="form-control" rows="4" formControlName="objectivesText"></textarea>
            </div>
            <div class="col-md-6">
              <label class="form-label">Outcomes <span class="small-muted">(one per line)</span></label>
              <textarea class="form-control" rows="4" formControlName="outcomesText"></textarea>
            </div>
            <div class="col-md-6">
              <label class="form-label">Who Should Attend <span class="small-muted">(one per line)</span></label>
              <textarea class="form-control" rows="4" formControlName="whoShouldAttendText"></textarea>
            </div>
            <div class="col-md-6">
              <label class="form-label">Prerequisites <span class="small-muted">(one per line)</span></label>
              <textarea class="form-control" rows="4" formControlName="prerequisitesText"></textarea>
            </div>
          </div>
        }

        <!-- Step 3: Media -->
        @if (step() === 3) {
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Thumbnail URL</label>
              <input class="form-control" formControlName="thumbnail" placeholder="/assets/img/480x320/img1.jpg">
            </div>
            <div class="col-md-6">
              <label class="form-label">Banner URL</label>
              <input class="form-control" formControlName="banner" placeholder="/assets/img/1920x800/img1.jpg">
            </div>
            <div class="col-12">
              <label class="form-label">Brochure URL</label>
              <input class="form-control" formControlName="brochureUrl" placeholder="https://.../brochure.pdf">
            </div>
            <div class="col-12">
              <label class="form-label">Gallery Images <span class="small-muted">(one URL per line)</span></label>
              <textarea class="form-control" rows="3" formControlName="galleryText"></textarea>
            </div>
          </div>
        }

        <!-- Step 4: Topics -->
        @if (step() === 4) {
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="mb-0">Course Topics</h6>
            <button type="button" class="btn btn-sm btn-outline-secondary" (click)="addTopic()">
              <i class="bi bi-plus-lg"></i> Add Topic
            </button>
          </div>

          @if (topics.controls.length === 0) {
            <p class="small-muted">No topics added yet.</p>
          }

          <div formArrayName="topics">
            @for (topicGroup of topics.controls; track topicGroup; let i = $index) {
              <div class="wf-card mb-3 p-3" [formGroupName]="i">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <strong>Topic {{ i + 1 }}</strong>
                  <button type="button" class="btn btn-sm btn-outline-danger" (click)="removeTopic(i)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
                <div class="row g-2">
                  <div class="col-md-8">
                    <label class="form-label">Title</label>
                    <input class="form-control" formControlName="title">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Duration</label>
                    <input class="form-control" formControlName="duration" placeholder="e.g. 3 Hours">
                  </div>
                  <div class="col-12">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" rows="2" formControlName="description"></textarea>
                  </div>
                  <div class="col-12">
                    <label class="form-label">Learning Points <span class="small-muted">(one per line)</span></label>
                    <textarea class="form-control" rows="2" formControlName="learningPointsText"></textarea>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Step 5: Session -->
        @if (step() === 5) {
          @if (isEdit) {
            <div class="alert alert-info">
              <i class="bi bi-info-circle me-2"></i>
              Sessions for an existing course are managed separately. Skip to review to save your changes.
            </div>
          } @else {
            <div class="row g-3">
              <div class="col-12">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" formControlName="createSession" id="create-session">
                  <label class="form-check-label" for="create-session">
                    Create an initial session for this course
                  </label>
                </div>
              </div>

              @if (form.get('createSession')?.value) {
                <div class="col-md-6">
                  <label class="form-label">Venue *</label>
                  <select class="form-select" formControlName="venueId">
                    <option value="" disabled>Select a venue</option>
                    @for (venue of venues(); track venue.id) {
                      <option [value]="venue.id">{{ venue.name }} — {{ venue.city }}</option>
                    }
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Delivery Mode</label>
                  <select class="form-select" formControlName="sessionDeliveryMode">
                    @for (mode of deliveryModes; track mode) {
                      <option [value]="mode">{{ mode }}</option>
                    }
                  </select>
                </div>

                <div class="col-md-4">
                  <label class="form-label">Start Date</label>
                  <input type="date" class="form-control" formControlName="startDate">
                </div>
                <div class="col-md-4">
                  <label class="form-label">End Date</label>
                  <input type="date" class="form-control" formControlName="endDate">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Registration Deadline</label>
                  <input type="date" class="form-control" formControlName="registrationDeadline">
                </div>

                <div class="col-md-4">
                  <label class="form-label">Price</label>
                  <input type="number" class="form-control" formControlName="price">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Currency</label>
                  <input class="form-control" formControlName="currency" placeholder="GBP">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Total Seats</label>
                  <input type="number" class="form-control" formControlName="totalSeats">
                </div>

                <div class="col-md-6">
                  <label class="form-label">Instructor</label>
                  <input class="form-control" formControlName="instructor">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Status</label>
                  <select class="form-select" formControlName="sessionStatus">
                    <option>Upcoming</option>
                    <option>Open</option>
                    <option>Few Seats</option>
                    <option>Full</option>
                  </select>
                </div>
              }
            </div>
          }
        }

        <!-- Step 6: Review -->
        @if (step() === 6) {
          <div class="alert alert-success">
            <i class="bi bi-check-circle me-2"></i>
            Review the summary below, then save.
          </div>
          <dl class="detail-list">
            <div class="detail-row"><dt>Name</dt><dd>{{ form.get('name')?.value || '—' }}</dd></div>
            <div class="detail-row"><dt>Code</dt><dd>{{ form.get('code')?.value || '—' }}</dd></div>
            <div class="detail-row"><dt>Category</dt><dd>{{ categoryName() }}</dd></div>
            <div class="detail-row"><dt>Level</dt><dd>{{ form.get('level')?.value }}</dd></div>
            <div class="detail-row"><dt>Delivery Modes</dt><dd>{{ selectedModes.join(', ') || '—' }}</dd></div>
            <div class="detail-row"><dt>Topics</dt><dd>{{ topics.length }} added</dd></div>
            @if (!isEdit) {
              <div class="detail-row">
                <dt>Initial Session</dt>
                <dd>{{ form.get('createSession')?.value ? 'Will be created' : 'None' }}</dd>
              </div>
            }
          </dl>

          @if (errorMessage) {
            <div class="alert alert-danger">{{ errorMessage }}</div>
          }
        }

      </form>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-outline-secondary" (click)="previous()" [disabled]="step() === 1">
        <i class="bi bi-arrow-left"></i> Previous
      </button>

      <div class="ms-auto d-flex gap-2">
        <button type="button" class="btn btn-secondary" (click)="activeModal.dismiss()">Cancel</button>

        @if (step() < steps.length) {
          <button type="button" class="btn btn-primary" (click)="next()" [disabled]="!canProceed()">
            Continue <i class="bi bi-arrow-right"></i>
          </button>
        } @else {
          <button type="button" class="btn btn-primary" [disabled]="isSaving" (click)="save()">
            {{ isSaving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Course') }}
          </button>
        }
      </div>
    </div>
  `,
})
export class CourseModal implements OnInit {
  @Input() course?: Course;

  readonly activeModal = inject(NgbActiveModal);
  private readonly fb = inject(FormBuilder);
  private readonly courseService = inject(CourseService);
  private readonly categoryService = inject(CourseCategoryService);
  private readonly venueService = inject(TrainingVenueService);
  private readonly sessionService = inject(CourseSessionService);

  readonly steps = ['Basic Info', 'Details', 'Media', 'Topics', 'Session', 'Review'];
  readonly deliveryModes = DELIVERY_MODES;
  readonly levels = LEVELS;

  readonly step = signal(1);
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');

  readonly categories = toSignal(this.categoryService.categories$, { initialValue: [] });
  readonly venues = toSignal(this.venueService.venues$, { initialValue: [] });

  selectedModes: string[] = [];

  form!: FormGroup;
  errorMessageValue = '';

  get isEdit(): boolean {
    return !!this.course;
  }

  get topics(): FormArray {
    return this.form.get('topics') as FormArray;
  }

  readonly categoryName = computed(() => {
    const id = this.form?.get('categoryId')?.value;
    return this.categories().find((c) => c.id === id)?.name ?? '—';
  });

  ngOnInit(): void {
    this.selectedModes = [...(this.course?.deliveryModes ?? [])];

    this.form = this.fb.group({
      name: [this.course?.name ?? '', Validators.required],
      code: [this.course?.code ?? '', Validators.required],
      categoryId: [this.course?.categoryId ?? '', Validators.required],
      level: [this.course?.level ?? 'Beginner'],
      language: [this.course?.language ?? 'English'],
      duration: [this.course?.duration ?? ''],
      accreditation: [this.course?.accreditation ?? ''],
      certificate: [this.course?.certificate ?? true],
      featured: [this.course?.featured ?? false],
      isActive: [this.course?.isActive ?? true],
      shortDescription: [this.course?.shortDescription ?? '', Validators.required],
      tagsText: [fromList(this.course?.tags).replace(/\n/g, ', ')],
      industriesText: [fromList(this.course?.industries).replace(/\n/g, ', ')],

      overview: [''],
      objectivesText: [''],
      outcomesText: [''],
      whoShouldAttendText: [''],
      prerequisitesText: [''],

      thumbnail: [this.course?.thumbnail ?? ''],
      banner: [this.course?.banner ?? ''],
      brochureUrl: [this.course?.brochureUrl ?? ''],
      galleryText: [fromList(this.course?.gallery)],

      topics: this.fb.array([]),

      createSession: [false],
      venueId: [''],
      sessionDeliveryMode: ['Classroom'],
      startDate: [''],
      endDate: [''],
      registrationDeadline: [''],
      price: [0],
      currency: ['GBP'],
      totalSeats: [20],
      instructor: [''],
      sessionStatus: ['Upcoming'],
    });

    if (this.course) {
      this.courseService.getDetails(this.course.id).subscribe((details) => {
        this.form.patchValue({
          overview: details?.overview ?? '',
          objectivesText: fromList(details?.objectives),
          outcomesText: fromList(details?.outcomes),
          whoShouldAttendText: fromList(details?.whoShouldAttend),
          prerequisitesText: fromList(details?.prerequisites),
        });
      });

      this.courseService.getTopics(this.course.id).subscribe((topics) => {
        for (const topic of topics) {
          this.topics.push(this.buildTopicGroup(topic));
        }
      });
    }
  }

  private buildTopicGroup(topic?: {
    title?: string;
    description?: string;
    duration?: string;
    learningPoints?: string[];
  }) {
    return this.fb.group({
      title: [topic?.title ?? ''],
      description: [topic?.description ?? ''],
      duration: [topic?.duration ?? ''],
      learningPointsText: [fromList(topic?.learningPoints)],
    });
  }

  addTopic(): void {
    this.topics.push(this.buildTopicGroup());
  }

  removeTopic(index: number): void {
    this.topics.removeAt(index);
  }

  isModeSelected(mode: string): boolean {
    return this.selectedModes.includes(mode);
  }

  toggleMode(mode: string): void {
    this.selectedModes = this.isModeSelected(mode)
      ? this.selectedModes.filter((m) => m !== mode)
      : [...this.selectedModes, mode];
  }

  canProceed(): boolean {
    if (this.step() === 1) {
      return !!(
        this.form.get('name')?.value &&
        this.form.get('code')?.value &&
        this.form.get('categoryId')?.value &&
        this.form.get('shortDescription')?.value
      );
    }
    return true;
  }

  next(): void {
    if (this.canProceed() && this.step() < this.steps.length) {
      this.step.set(this.step() + 1);
    }
  }

  previous(): void {
    if (this.step() > 1) {
      this.step.set(this.step() - 1);
    }
  }

  private buildCourseFormInput(): CourseFormInput {
    const v = this.form.value;

    return {
      categoryId: v.categoryId,
      code: v.code,
      name: v.name,
      shortDescription: v.shortDescription,
      duration: v.duration,
      language: v.language,
      level: v.level,
      deliveryModes: this.selectedModes as Course['deliveryModes'],
      certificate: v.certificate,
      accreditation: v.accreditation,
      brochureUrl: v.brochureUrl,
      thumbnail: v.thumbnail,
      banner: v.banner,
      gallery: toList(v.galleryText),
      tags: toList(v.tagsText),
      industries: toList(v.industriesText),
      featured: v.featured,
      isActive: v.isActive,
      details: {
        overview: v.overview,
        objectives: toList(v.objectivesText),
        outcomes: toList(v.outcomesText),
        whoShouldAttend: toList(v.whoShouldAttendText),
        prerequisites: toList(v.prerequisitesText),
      },
      topics: this.topics.controls.map((group, i) => ({
        title: group.get('title')?.value ?? '',
        description: group.get('description')?.value ?? '',
        duration: group.get('duration')?.value ?? '',
        learningPoints: toList(group.get('learningPointsText')?.value ?? ''),
        order: i + 1,
        lessons: [],
      })),
    };
  }

  async save(): Promise<void> {
    this.isSaving.set(true);
    this.errorMessage.set('');

    try {
      const input = this.buildCourseFormInput();
      let courseId: string;

      if (this.isEdit && this.course) {
        courseId = this.course.id;
        await this.courseService.update(courseId, input);
      } else {
        courseId = await this.courseService.create(input);

        if (this.form.get('createSession')?.value) {
          const v = this.form.value;

          await this.sessionService.create(courseId, {
            venueId: v.venueId,
            startDate: new Date(v.startDate),
            endDate: new Date(v.endDate),
            registrationDeadline: new Date(v.registrationDeadline),
            duration: v.duration,
            price: Number(v.price) || 0,
            currency: v.currency,
            availableSeats: Number(v.totalSeats) || 0,
            totalSeats: Number(v.totalSeats) || 0,
            instructor: v.instructor,
            deliveryMode: v.sessionDeliveryMode,
            status: v.sessionStatus,
            notes: '',
            isFeatured: false,
          });
        }
      }

      this.activeModal.close(true);
    } catch (err: any) {
      this.errorMessage.set(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      this.isSaving.set(false);
    }
  }
}
