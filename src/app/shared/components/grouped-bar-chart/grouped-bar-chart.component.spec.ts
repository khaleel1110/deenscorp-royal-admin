import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GroupedBarChartComponent } from './grouped-bar-chart.component';

const chartJsMock = vi.hoisted(() => {
  const instances: Array<{ config: unknown; destroy: ReturnType<typeof vi.fn> }> = [];
  const Chart = vi.fn(function ChartConstructor(this: { config: unknown; destroy: ReturnType<typeof vi.fn> }, _context: unknown, config: unknown) {
    this.config = config;
    this.destroy = vi.fn();
    instances.push(this);
  });
  return { Chart, instances, register: vi.fn() };
});

vi.mock('chart.js', () => {
  (chartJsMock.Chart as unknown as { register: typeof chartJsMock.register }).register = chartJsMock.register;
  return {
    BarController: class BarController {},
    BarElement: class BarElement {},
    CategoryScale: class CategoryScale {},
    Chart: chartJsMock.Chart,
    LinearScale: class LinearScale {},
    Tooltip: class Tooltip {},
  };
});

describe('GroupedBarChartComponent', () => {
  let fixture: ComponentFixture<GroupedBarChartComponent>;
  let getContextSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    chartJsMock.Chart.mockClear();
    chartJsMock.instances.length = 0;
    getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as CanvasRenderingContext2D);
    TestBed.configureTestingModule({ imports: [GroupedBarChartComponent] });
  });

  afterEach(() => {
    fixture?.destroy();
    getContextSpy.mockRestore();
  });

  it('creates a Chart.js grouped bar chart with supplied labels and datasets', () => {
    fixture = TestBed.createComponent(GroupedBarChartComponent);
    fixture.componentRef.setInput('labels', ['Mar', 'Apr']);
    fixture.componentRef.setInput('datasets', [{ label: 'Management', data: [1200000, 1800000] }]);

    fixture.detectChanges();

    expect(chartJsMock.Chart).toHaveBeenCalledTimes(1);
    expect((chartJsMock.instances[0].config as { data: { labels: string[]; datasets: Array<{ label: string; data: number[] }> } }).data.labels).toEqual(['Mar', 'Apr']);
    expect((chartJsMock.instances[0].config as { data: { datasets: Array<{ label: string; data: number[] }> } }).data.datasets[0].label).toBe('Management');
  });

  it('recreates the chart when inputs change and destroys it on teardown', () => {
    fixture = TestBed.createComponent(GroupedBarChartComponent);
    fixture.componentRef.setInput('labels', ['Mar']);
    fixture.componentRef.setInput('datasets', [{ label: 'Management', data: [1200000] }]);
    fixture.detectChanges();
    const first = chartJsMock.instances[0];

    fixture.componentRef.setInput('labels', ['Apr']);
    fixture.detectChanges();

    expect(first.destroy).toHaveBeenCalled();
    expect(chartJsMock.Chart).toHaveBeenCalledTimes(2);

    const second = chartJsMock.instances[1];
    fixture.destroy();
    expect(second.destroy).toHaveBeenCalled();
  });
});
