import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
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
      <form [formGroup]="form">

        <!-- Step 1: Basic Info -->
        @if (step() === 1) {
          <h5 class="mb-3">{{ steps[0] }}</h5>
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

            <!-- Dynamic Tags (Step 1) -->
            <div class="col-md-6">
              <label class="form-label">Tags</label>
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="small-muted">One per line</span>
                <button type="button" class="btn btn-sm btn-outline-secondary" (click)="addItem('tags')">
                  <i class="bi bi-plus-lg"></i> Add
                </button>
              </div>
              <div formArrayName="tags">
                @for (ctrl of getFormArray('tags').controls; track ctrl; let i = $index) {
                  <div class="input-group mb-1">
                    <input class="form-control" [formControlName]="i" placeholder="Tag">
                    <button type="button" class="btn btn-sm btn-outline-danger" (click)="removeItem('tags', i)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                }
              </div>
            </div>

            <!-- Dynamic Industries (Step 1) -->
            <div class="col-md-6">
              <label class="form-label">Industries</label>
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="small-muted">One per line</span>
                <button type="button" class="btn btn-sm btn-outline-secondary" (click)="addItem('industries')">
                  <i class="bi bi-plus-lg"></i> Add
                </button>
              </div>
              <div formArrayName="industries">
                @for (ctrl of getFormArray('industries').controls; track ctrl; let i = $index) {
                  <div class="input-group mb-1">
                    <input class="form-control" [formControlName]="i" placeholder="Industry">
                    <button type="button" class="btn btn-sm btn-outline-danger" (click)="removeItem('industries', i)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- Step 2: Details -->
        @if (step() === 2) {
          <h5 class="mb-3">{{ steps[1] }}</h5>
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label">Overview</label>
              <textarea class="form-control" rows="3" formControlName="overview"></textarea>
            </div>

            <!-- DYNAMIC ARRAY: Objectives -->
            <div class="col-md-6">
              <label class="form-label">Objectives</label>
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="small-muted">Add one per line</span>
                <button type="button" class="btn btn-sm btn-outline-secondary" (click)="addItem('objectives')">
                  <i class="bi bi-plus-lg"></i> Add
                </button>
              </div>
              <div formArrayName="objectives">
                @for (ctrl of getFormArray('objectives').controls; track ctrl; let i = $index) {
                  <div class="input-group mb-1">
                    <input class="form-control" [formControlName]="i" placeholder="Objective">
                    <button type="button" class="btn btn-sm btn-outline-danger" (click)="removeItem('objectives', i)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                }
              </div>
            </div>

            <!-- DYNAMIC ARRAY: Outcomes -->
            <div class="col-md-6">
              <label class="form-label">Outcomes</label>
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="small-muted">Add one per line</span>
                <button type="button" class="btn btn-sm btn-outline-secondary" (click)="addItem('outcomes')">
                  <i class="bi bi-plus-lg"></i> Add
                </button>
              </div>
              <div formArrayName="outcomes">
                @for (ctrl of getFormArray('outcomes').controls; track ctrl; let i = $index) {
                  <div class="input-group mb-1">
                    <input class="form-control" [formControlName]="i" placeholder="Outcome">
                    <button type="button" class="btn btn-sm btn-outline-danger" (click)="removeItem('outcomes', i)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                }
              </div>
            </div>

            <!-- DYNAMIC ARRAY: Who Should Attend -->
            <div class="col-md-6">
              <label class="form-label">Who Should Attend</label>
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="small-muted">Add one per line</span>
                <button type="button" class="btn btn-sm btn-outline-secondary" (click)="addItem('whoShouldAttend')">
                  <i class="bi bi-plus-lg"></i> Add
                </button>
              </div>
              <div formArrayName="whoShouldAttend">
                @for (ctrl of getFormArray('whoShouldAttend').controls; track ctrl; let i = $index) {
                  <div class="input-group mb-1">
                    <input class="form-control" [formControlName]="i" placeholder="Who should attend">
                    <button type="button" class="btn btn-sm btn-outline-danger" (click)="removeItem('whoShouldAttend', i)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                }
              </div>
            </div>

            <!-- DYNAMIC ARRAY: Prerequisites -->
            <div class="col-md-6">
              <label class="form-label">Prerequisites</label>
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="small-muted">Add one per line</span>
                <button type="button" class="btn btn-sm btn-outline-secondary" (click)="addItem('prerequisites')">
                  <i class="bi bi-plus-lg"></i> Add
                </button>
              </div>
              <div formArrayName="prerequisites">
                @for (ctrl of getFormArray('prerequisites').controls; track ctrl; let i = $index) {
                  <div class="input-group mb-1">
                    <input class="form-control" [formControlName]="i" placeholder="Prerequisite">
                    <button type="button" class="btn btn-sm btn-outline-danger" (click)="removeItem('prerequisites', i)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- Step 3: Media -->
        @if (step() === 3) {
          <h5 class="mb-3">{{ steps[2] }}</h5>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Thumbnail URL</label>
              <input class="form-control" formControlName="thumbnail">
            </div>
            <div class="col-md-6">
              <label class="form-label">Banner URL</label>
              <input class="form-control" formControlName="banner">
            </div>
            <div class="col-12">
              <label class="form-label">Brochure URL</label>
              <input class="form-control" formControlName="brochureUrl">
            </div>

            <!-- DYNAMIC ARRAY: Gallery -->
            <div class="col-12">
              <label class="form-label">Gallery Images</label>
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="small-muted">One URL per item</span>
                <button type="button" class="btn btn-sm btn-outline-secondary" (click)="addItem('gallery')">
                  <i class="bi bi-plus-lg"></i> Add
                </button>
              </div>
              <div formArrayName="gallery">
                @for (ctrl of getFormArray('gallery').controls; track ctrl; let i = $index) {
                  <div class="input-group mb-1">
                    <input class="form-control" [formControlName]="i" placeholder="Image URL">
                    <button type="button" class="btn btn-sm btn-outline-danger" (click)="removeItem('gallery', i)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- Step 4: Topics -->
        @if (step() === 4) {
          <h5 class="mb-3">{{ steps[3] }}</h5>
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
                    <input class="form-control" formControlName="duration">
                  </div>
                  <div class="col-12">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" rows="2" formControlName="description"></textarea>
                  </div>

                  <!-- DYNAMIC ARRAY: Learning Points inside topic -->
                  <div class="col-12">
                    <label class="form-label">Learning Points</label>
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <span class="small-muted">One per line</span>
                      <button type="button" class="btn btn-sm btn-outline-secondary" (click)="addLearningPoint(i)">
                        <i class="bi bi-plus-lg"></i> Add
                      </button>
                    </div>
                    <div formArrayName="learningPoints">
                      @for (lpCtrl of getLearningPoints(i).controls; track lpCtrl; let j = $index) {
                        <div class="input-group mb-1">
                          <input class="form-control" [formControlName]="j" placeholder="Learning point">
                          <button type="button" class="btn btn-sm btn-outline-danger" (click)="removeLearningPoint(i, j)">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Step 5: Session -->
        @if (step() === 5) {
          <h5 class="mb-3">{{ steps[4] }}</h5>
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
          <h5 class="mb-3">{{ steps[5] }}</h5>
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
            <div class="detail-row"><dt>Objectives</dt><dd>{{ getArrayValues('objectives').join(', ') || '—' }}</dd></div>
            <div class="detail-row"><dt>Outcomes</dt><dd>{{ getArrayValues('outcomes').join(', ') || '—' }}</dd></div>
            <div class="detail-row"><dt>Who Should Attend</dt><dd>{{ getArrayValues('whoShouldAttend').join(', ') || '—' }}</dd></div>
            <div class="detail-row"><dt>Prerequisites</dt><dd>{{ getArrayValues('prerequisites').join(', ') || '—' }}</dd></div>
            <div class="detail-row"><dt>Tags</dt><dd>{{ getArrayValues('tags').join(', ') || '—' }}</dd></div>
            <div class="detail-row"><dt>Industries</dt><dd>{{ getArrayValues('industries').join(', ') || '—' }}</dd></div>
            <div class="detail-row"><dt>Topics</dt><dd>{{ topics.length }} added</dd></div>
            @if (!isEdit) {
              <div class="detail-row">
                <dt>Initial Session</dt>
                <dd>{{ form.get('createSession')?.value ? 'Will be created' : 'None' }}</dd>
              </div>
            }
          </dl>

          @if (errorMessage()) {
            <div class="alert alert-danger">{{ errorMessage() }}</div>
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
          <button type="button" class="btn btn-primary" [disabled]="isSaving()" (click)="save()">
            {{ isSaving() ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Course') }}
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
      // Basic Info
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

      // Details (arrays)
      overview: [this.course?.details?.overview ?? ''],
      objectives: this.fb.array<string>([]),
      outcomes: this.fb.array<string>([]),
      whoShouldAttend: this.fb.array<string>([]),
      prerequisites: this.fb.array<string>([]),

      // Media
      thumbnail: [this.course?.thumbnail ?? ''],
      banner: [this.course?.banner ?? ''],
      brochureUrl: [this.course?.brochureUrl ?? ''],
      gallery: this.fb.array<string>([]),

      // Tags & Industries (arrays)
      tags: this.fb.array<string>([]),
      industries: this.fb.array<string>([]),

      // Topics
      topics: this.fb.array([]),

      // Session
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

    // Populate arrays if editing
    if (this.course) {
      this.setArray('objectives', this.course.details?.objectives ?? []);
      this.setArray('outcomes', this.course.details?.outcomes ?? []);
      this.setArray('whoShouldAttend', this.course.details?.whoShouldAttend ?? []);
      this.setArray('prerequisites', this.course.details?.prerequisites ?? []);
      this.setArray('gallery', this.course.gallery ?? []);
      this.setArray('tags', this.course.tags ?? []);
      this.setArray('industries', this.course.industries ?? []);

      // Load topics
      this.courseService.getTopics(this.course.id).subscribe((topics) => {
        for (const topic of topics) {
          this.topics.push(this.buildTopicGroup(topic));
        }
      });
    }
  }

  // Helper to get a FormArray by name
  getFormArray(name: string): FormArray {
    return this.form.get(name) as FormArray;
  }

  // Add an empty string to a FormArray
  addItem(name: string): void {
    const arr = this.getFormArray(name);
    arr.push(new FormControl(''));
  }

  // Remove item at index from a FormArray
  removeItem(name: string, index: number): void {
    const arr = this.getFormArray(name);
    arr.removeAt(index);
  }

  // Set array values from a string array
  setArray(name: string, values: string[]): void {
    const arr = this.getFormArray(name);
    arr.clear();
    values.forEach(v => arr.push(new FormControl(v)));
  }

  // Get values from a FormArray as string[]
  getArrayValues(name: string): string[] {
    return this.getFormArray(name).controls.map(c => c.value).filter(v => v?.trim());
  }

  // Build a topic FormGroup
  private buildTopicGroup(topic?: {
    title?: string;
    description?: string;
    duration?: string;
    learningPoints?: string[];
  }) {
    const group = this.fb.group({
      title: [topic?.title ?? ''],
      description: [topic?.description ?? ''],
      duration: [topic?.duration ?? ''],
      learningPoints: this.fb.array<string>([]),
    });
    if (topic?.learningPoints) {
      const lpArray = group.get('learningPoints') as FormArray;
      topic.learningPoints.forEach(lp => lpArray.push(new FormControl(lp)));
    }
    return group;
  }

  // Get learningPoints FormArray for a specific topic
  getLearningPoints(topicIndex: number): FormArray {
    const topicGroup = this.topics.at(topicIndex) as FormGroup;
    return topicGroup.get('learningPoints') as FormArray;
  }

  addLearningPoint(topicIndex: number): void {
    const lpArray = this.getLearningPoints(topicIndex);
    lpArray.push(new FormControl(''));
  }

  removeLearningPoint(topicIndex: number, pointIndex: number): void {
    const lpArray = this.getLearningPoints(topicIndex);
    lpArray.removeAt(pointIndex);
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
      gallery: this.getArrayValues('gallery'),
      tags: this.getArrayValues('tags'),
      industries: this.getArrayValues('industries'),
      featured: v.featured,
      isActive: v.isActive,
      details: {
        overview: v.overview,
        objectives: this.getArrayValues('objectives'),
        outcomes: this.getArrayValues('outcomes'),
        whoShouldAttend: this.getArrayValues('whoShouldAttend'),
        prerequisites: this.getArrayValues('prerequisites'),
      },
      topics: this.topics.controls.map((group, i) => {
        const formGroup = group as FormGroup;           // cast to FormGroup
        const lpArray = formGroup.get('learningPoints') as FormArray;
        const learningPoints = lpArray.controls.map(c => c.value).filter(v => v?.trim());
        return {
          title: formGroup.get('title')?.value ?? '',
          description: formGroup.get('description')?.value ?? '',
          duration: formGroup.get('duration')?.value ?? '',
          learningPoints,
          order: i + 1,
          lessons: [],
        };
      }),
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
          const startDate = v.startDate ? new Date(v.startDate) : undefined;
          const endDate = v.endDate ? new Date(v.endDate) : undefined;
          const regDeadline = v.registrationDeadline ? new Date(v.registrationDeadline) : undefined;

          if (v.venueId && startDate && endDate) {
            await this.sessionService.create(courseId, {
              venueId: v.venueId,
              startDate,
              endDate,
              registrationDeadline: regDeadline || new Date(),
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
          } else {
            console.warn('Session creation skipped: missing venue or dates.');
          }
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
