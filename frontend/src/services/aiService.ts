import type { QueueForecastPoint, Bottleneck, AdminStats } from '@/types';
import { apiFetch } from './api';

export async function getCongestionForecast(centreId: string = 'c1'): Promise<QueueForecastPoint[]> {
  return await apiFetch<QueueForecastPoint[]>(`/forecast/${centreId}`);
}

export async function getAdminStats(): Promise<AdminStats> {
  return await apiFetch<AdminStats>('/admin/overview');
}

export async function getBottlenecks(): Promise<Bottleneck[]> {
  return await apiFetch<Bottleneck[]>('/admin/bottlenecks');
}

export async function resolveBottleneck(id: string): Promise<any> {
  return await apiFetch<any>(`/admin/bottlenecks/${id}/resolve`, {
    method: 'POST',
  });
}

export async function updateCentreCounters(centreId: string, activeCounters: number): Promise<any> {
  return await apiFetch<any>(`/admin/centres/${centreId}/update-counters`, {
    method: 'POST',
    body: JSON.stringify({ active_counters: activeCounters }),
  });
}
