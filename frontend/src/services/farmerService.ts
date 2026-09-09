import type { Farmer } from '@/types';
import { mockFarmer } from '@/data/mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getFarmerProfile(): Promise<Farmer> {
  await delay(300);
  return mockFarmer;
}

export async function updateCrop(crop: string, quantity: number): Promise<Farmer> {
  await delay(500);
  return { ...mockFarmer, crop, expectedQuantity: quantity };
}
