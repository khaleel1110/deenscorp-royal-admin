import { Component, OnInit, signal } from '@angular/core';

@Component({
  selector: 'yex-splash-screen',
  standalone: true,
  imports: [],
  template: `
    <!-- ============================================================
        SPLASH SCREEN – HTML
        ============================================================ -->
    <div class="splash-shell">
      <div class="splash-content">
        <!-- Logo -->
        <div class="splash-logo">
          <img src="/DCR_1.svg" alt="AA Gwarzo 5-aside Arena" />
        </div>

        <!-- Brand name -->
        <h1 class="splash-title">Deenscorp Royal</h1>
        <p class="splash-subtitle">Deenscorp Royal · Operations Console</p>

        <!-- Progress bar -->
        <div class="splash-progress-wrap">
          <div class="splash-progress-track">
            <div
              class="splash-progress-bar"
              [style.width.%]="progress"
              role="progressbar"
              aria-valuenow="100"
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>

        <!-- Footer -->
        <p class="splash-footer">
          Powered by Deenscorp &bull; <span class="splash-year">2026</span>
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      /* ============================================================
     SPLASH SCREEN – SCSS
     ============================================================ */
      .splash-shell {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: linear-gradient(145deg, #f8fafc 0%, #eef2f6 100%);
        font-family:
          'Inter',
          system-ui,
          -apple-system,
          sans-serif;
        padding: 1.5rem;
      }

      .splash-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        max-width: 400px;
        width: 100%;
        text-align: center;
        padding: 2.5rem 2rem;
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-radius: 32px;
        border: 1px solid rgba(255, 255, 255, 0.5);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        transition: transform 0.3s ease;
      }

      .splash-logo {
        width: 120px;
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: #ffffff;
        box-shadow: 0 8px 24px rgba(11, 30, 51, 0.08);
        padding: 1.2rem;
        transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .splash-logo img {
        width: 100%;
        height: auto;
        object-fit: contain;
        display: block;
      }

      .splash-content:hover .splash-logo {
        transform: scale(1.04) rotate(-2deg);
      }

      .splash-title {
        font-size: 1.6rem;
        font-weight: 700;
        color: #000000;
        letter-spacing: -0.02em;
        margin: 0;
        line-height: 1.2;
      }

      .splash-subtitle {
        font-size: 0.85rem;
        font-weight: 500;
        color: #6c7a8a;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        margin: -0.5rem 0 0.25rem;
      }

      /* Progress */
      .splash-progress-wrap {
        width: 100%;
        max-width: 260px;
        margin: 0.5rem 0 0.25rem;
      }

      .splash-progress-track {
        width: 100%;
        height: 6px;
        background: #e2e8f0;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
      }

      .splash-progress-bar {
        height: 100%;
        background: linear-gradient(145deg, #ca5532 0%, #b54e2d 100%);
        border-radius: 12px;
        transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        width: 0%;
      }

      /* Footer */
      .splash-footer {
        font-size: 0.7rem;
        color: #000000;
        margin-top: 0.75rem;
        letter-spacing: 0.02em;
      }

      .splash-year {
        font-weight: 500;
        color: #000000;
      }

      /* ---- Entrance animation ---- */
      .splash-content {
        animation: splashFadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        opacity: 0;
        transform: translateY(20px) scale(0.96);
      }

      @keyframes splashFadeUp {
        0% {
          opacity: 0;
          transform: translateY(20px) scale(0.96);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Logo pulse on load */
      .splash-logo {
        animation: logoPulse 2s ease-in-out infinite 0.8s;
      }

      @keyframes logoPulse {
        0%,
        100% {
          box-shadow: 0 8px 24px rgba(11, 30, 51, 0.08);
        }
        50% {
          box-shadow: 0 12px 36px rgba(11, 30, 51, 0.14);
        }
      }

      /* ---- Responsive ---- */
      @media (max-width: 480px) {
        .splash-content {
          padding: 2rem 1.25rem;
          border-radius: 24px;
          gap: 1rem;
        }
        .splash-logo {
          width: 90px;
          height: 90px;
          padding: 1rem;
        }
        .splash-title {
          font-size: 1.3rem;
        }
        .splash-subtitle {
          font-size: 0.75rem;
        }
        .splash-progress-wrap {
          max-width: 200px;
        }
      }
    `,
  ],
})
export class SplashScreenComponent implements OnInit {
  progress = 0;

  ngOnInit(): void {
    // Animate progress from 0 → 100% over 1.2s
    setTimeout(() => {
      this.progress = 100;
    }, 300);
  }
}
