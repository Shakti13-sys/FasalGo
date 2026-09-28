import type { CentreRecommendation, BestTimeSlot, RerouteSuggestion } from '@/types';
import { apiFetch } from './api';

export async function getRecommendations(
  lat: number = 19.9975,
  lon: number = 73.7898
): Promise<CentreRecommendation[]> {
  return await apiFetch<CentreRecommendation[]>(`/recommendations/centres?lat=${lat}&lon=${lon}`);
}

export async function getTopRecommendation(
  lat: number = 19.9975,
  lon: number = 73.7898
): Promise<CentreRecommendation> {
  const recs = await getRecommendations(lat, lon);
  return recs[0];
}

export async function getBestTime(centreId: string = 'c1'): Promise<BestTimeSlot> {
  return await apiFetch<BestTimeSlot>(`/recommendations/best-time?centre_id=${centreId}`);
}

export async function checkRerouteRecommendation(tokenId: string): Promise<any> {
  return await apiFetch<any>(`/recommendations/reroute/${tokenId}`);
}
