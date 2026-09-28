import type { ProcurementCentre, CongestionLevel } from '@/types';
import { apiFetch } from './api';

export async function getCentres(
  lat: number = 19.9975,
  lon: number = 73.7898,
  search?: string
): Promise<ProcurementCentre[]> {
  const params = new URLSearchParams();
  params.set('lat', lat.toString());
  params.set('lon', lon.toString());
  if (search) params.set('search', search);

  return await apiFetch<ProcurementCentre[]>(`/centres?${params.toString()}`);
}

export async function getCentreById(
  id: string,
  lat: number = 19.9975,
  lon: number = 73.7898
): Promise<ProcurementCentre | undefined> {
  try {
    return await apiFetch<ProcurementCentre>(`/centres/${id}?lat=${lat}&lon=${lon}`);
  } catch {
    return undefined;
  }
}

export async function getCentresByCongestion(
  level: CongestionLevel,
  lat: number = 19.9975,
  lon: number = 73.7898
): Promise<ProcurementCentre[]> {
  const centres = await getCentres(lat, lon);
  return centres.filter((c) => c.congestion === level);
}
