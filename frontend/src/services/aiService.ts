import type { QueueForecastPoint } from '@/types';
import { mockForecast } from '@/data/mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getCongestionForecast(): Promise<QueueForecastPoint[]> {
  await delay(700);
  return mockForecast;
}

export async function getCentreForecast(centreId: string): Promise<QueueForecastPoint[]> {
  await delay(600);
  const variance = centreId.charCodeAt(2) % 3;
  return mockForecast.map((p) => ({
    ...p,
    value: Math.max(10, p.value + variance * 5),
    predictedFarmers: Math.max(5, p.predictedFarmers + variance * 3),
  }));
}
