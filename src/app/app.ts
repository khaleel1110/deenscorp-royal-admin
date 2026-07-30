import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SplashScreenComponent } from './features/authentication/splash-screen/splash-screen.component';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SplashScreenComponent],
  standalone: true,
  template: ` <!--@if (showSplashScreen) {
      <yex-splash-screen></yex-splash-screen>
    } @else {-->
      <router-outlet></router-outlet>
 <!--   }-->`,
})
export class App {
  showSplashScreen = true;

  ngOnInit() {
    setTimeout(() => {
      this.showSplashScreen = false;
    }, 1500);
  }
  protected readonly title = signal('deenscorp-royal-admin');
}
