import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  PieController,
} from 'chart.js';

Chart.register(
  PieController,
  ArcElement,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-pie-chart-dashboard',
  imports: [],
  templateUrl: './pie-chart-dashboard.html',
  styleUrl: './pie-chart-dashboard.scss',
})
export class PieChartDashboard implements AfterViewInit, OnDestroy {

  @ViewChild('pieChart') pieChart!: ElementRef<HTMLCanvasElement>;

  private chart!: Chart;

  ngAfterViewInit(): void {
    this.createPieChart();
  }

  private createPieChart(): void {
    const ctx = this.pieChart.nativeElement.getContext('2d');

    if (!ctx) {
      return;
    }

    this.chart = new Chart(ctx, {
      type: 'pie',

      data: {
        labels: [
          'New',
          'Overdue',
          'Completed',
          'Pending'
        ],

        datasets: [
          {
            data: [35, 20, 30, 15],

            backgroundColor: [
              '#377dff',
              '#29835a',
              '#00c9a7',
              '#f7b924'
            ],

            hoverBackgroundColor: [
              '#191a1c',
              '#eb3502',
              '#00c9a7',
              '#f7b924'
            ],

            borderWidth: 2,
            borderColor: '#ffffff',
          }
        ]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            display: false
          },

          tooltip: {
            enabled: true,

            callbacks: {
              label: (context) => {
                const label = context.label ?? '';
                const value = context.parsed;

                return ` ${label}: ${value}%`;
              }
            }
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
