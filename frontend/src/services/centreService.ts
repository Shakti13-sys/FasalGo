import type { ProcurementCentre, CongestionLevel } from '@/types';
import { mockCentres } from '@/data/mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getCentres(): Promise<ProcurementCentre[]> {
  await delay(600);
  return mockCentres;
}

export async function getCentreById(id: string): Promise<ProcurementCentre | undefined> {
  await delay(300);
  return mockCentres.find((c) => c.id === id);
}

export async function getCentresByCongestion(level: CongestionLevel): Promise<ProcurementCentre[]> {
  await delay(400);
  return mockCentres.filter((c) => c.congestion === level);
}
