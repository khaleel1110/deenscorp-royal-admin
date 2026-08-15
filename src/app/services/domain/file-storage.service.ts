import { inject, Injectable } from '@angular/core';
import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from '@angular/fire/storage';
import { Observable } from 'rxjs';

export interface UploadEvent {
  progress: number; // 0–100
  downloadURL?: string; // only set on the final, completed event
}

@Injectable({ providedIn: 'root' })
export class FileStorageService {
  private readonly storage = inject(Storage);

  /**
   * Uploads a file to `path`, emitting progress as it goes and completing
   * after the final event carries the download URL.
   */
  upload(path: string, file: File): Observable<UploadEvent> {
    return new Observable<UploadEvent>((subscriber) => {
      const storageRef = ref(this.storage, path);
      const task = uploadBytesResumable(storageRef, file);

      const unsubscribe = task.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          subscriber.next({ progress });
        },
        (error) => subscriber.error(error),
        async () => {
          try {
            const downloadURL = await getDownloadURL(task.snapshot.ref);
            subscriber.next({ progress: 100, downloadURL });
            subscriber.complete();
          } catch (error) {
            subscriber.error(error);
          }
        },
      );

      return () => unsubscribe();
    });
  }

  /** Best-effort delete — swallows errors so callers never need to guard (e.g. file already gone). */
  async deleteByUrl(url: string): Promise<void> {
    try {
      await deleteObject(ref(this.storage, url));
    } catch (error) {
      console.warn('Could not delete previous storage file (it may already be gone):', error);
    }
  }

  buildVenueImagePath(venueId: string | undefined, file: File): string {
    const safeId = venueId ?? 'new';
    const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    return `venues/${safeId}/${Date.now()}-${cleanName}`;
  }
}
