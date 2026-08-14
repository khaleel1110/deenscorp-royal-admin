import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  InMemoryScrollingOptions,
} from '@angular/router';

import { routes } from './app.routes';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';

import { getAuth, provideAuth, connectAuthEmulator } from '@angular/fire/auth';

import { getFirestore, provideFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';

import { getStorage, provideStorage, connectStorageEmulator } from '@angular/fire/storage';

import { environment } from '../environments/environment';
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {NgProgressHttpModule} from "ngx-progressbar/http";
import {NgProgressRouterModule} from "ngx-progressbar/router";

const scrollConfig: InMemoryScrollingOptions = {
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled',
};

let inMemoryScrollingFeature;
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({
      eventCoalescing: true,
    }),



    importProvidersFrom(NgbModule),

    importProvidersFrom(NgProgressHttpModule, NgProgressRouterModule),
    provideHttpClient(withInterceptorsFromDi()),



    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling(scrollConfig)),

    provideFirebaseApp(() => initializeApp(environment.firebaseApp)),

    provideAuth(() => {
      const auth = getAuth();

      if (environment.useEmulator) {
        connectAuthEmulator(auth, 'http://127.0.0.1:9099');
      }

      return auth;
    }),

    provideFirestore(() => {
      const firestore = getFirestore();

      if (environment.useEmulator) {
        connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
      }

      return firestore;
    }),

    provideStorage(() => {
      const storage = getStorage();

      if (environment.useEmulator) {
        connectStorageEmulator(storage, '127.0.0.1', 9199);
      }

      return storage;
    }),
  ],
};
