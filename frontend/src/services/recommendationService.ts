import type { CentreRecommendation, BestTimeSlot } from '@/types';
import { mockRecommendations, mockBestTime } from '@/data/mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getRecommendations(): Promise<CentreRecommendation[]> {
  await delay(900);
  return mockRecommendations;
}

export async function getTopRecommendation(): Promise<CentreRecommendation> {
  await delay(700);
  return mockRecommendations[0];
}

export async function getBestTime(): Promise<BestTimeSlot> {
  await delay(600);
  return mockBestTime;
}
