import { Component, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-test',
  imports: [],
  template: '<p>Check the console</p>',
})
export class Test {
  firestore = inject(Firestore);

  constructor() {
    console.log('Firestore instance:', this.firestore);
    console.log('Settings:', (this.firestore as any)._settings);
  }
}
