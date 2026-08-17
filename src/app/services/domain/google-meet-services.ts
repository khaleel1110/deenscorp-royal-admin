// src/app/services/google-meet.ts
import { Injectable } from '@angular/core';

declare const google: any;

export interface MeetEventResult {
  meetingLink: string;
  eventId: string;
  calendarEventLink: string;
}

const GOOGLE_CLIENT_ID = 'YOUR_OAUTH_CLIENT_ID.apps.googleusercontent.com';
const SCOPE = 'https://www.googleapis.com/auth/calendar.events';

@Injectable({ providedIn: 'root' })
export class GoogleMeetService {
  private tokenClient: any;
  private accessToken: string | null = null;
  private gisLoaded = false;

  private loadGis(): Promise<void> {
    if (this.gisLoaded) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => {
        this.gisLoaded = true;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  private async ensureToken(): Promise<string> {
    if (this.accessToken) return this.accessToken;

    await this.loadGis();

    return new Promise((resolve, reject) => {
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPE,
        callback: (response: any) => {
          if (response.error) {
            reject(response);
            return;
          }
          this.accessToken = response.access_token;
          resolve(this.accessToken as string);
        },
      });
      this.tokenClient.requestAccessToken();
    });
  }

  /**
   * Creates a Calendar event with Google Meet conferencing attached,
   * and returns the generated meet link.
   */
  async generateMeetLink(params: {
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
  }): Promise<MeetEventResult> {
    const token = await this.ensureToken();

    const requestId = crypto.randomUUID();

    const event = {
      summary: params.title,
      description: params.description ?? '',
      start: { dateTime: params.startDate.toISOString() },
      end: { dateTime: params.endDate.toISOString() },
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message ?? 'Failed to create Meet link');
    }

    const data = await res.json();

    return {
      meetingLink: data.hangoutLink,
      eventId: data.id,
      calendarEventLink: data.htmlLink,
    };
  }
}
