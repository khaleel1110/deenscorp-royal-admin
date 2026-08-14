import { inject, Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface CourseTopic {
  id: string;

  courseId: string;

  title: string;

  description: string;

  learningOutcomes: string[];

  duration: string;

  order: number;
}

@Injectable({
  providedIn: 'root',
})
export class CourseTopicService {
  private firestore = inject(Firestore);

  /**
   * Get all topics belonging to a course.
   */
  getByCourse(courseId: string): Observable<CourseTopic[]> {
    const ref = collection(this.firestore, `courses/${courseId}/topics`);

    return collectionData(ref, {
      idField: 'id',
    }) as Observable<CourseTopic[]>;
  }
}
