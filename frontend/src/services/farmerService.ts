import type { Farmer } from '@/types';
import { apiFetch } from './api';

export async function getFarmerProfile(): Promise<Farmer> {
  return await apiFetch<Farmer>('/farmers/me');
}

export async function updateCrop(crop: string, quantity: number): Promise<Farmer> {
  return await apiFetch<Farmer>('/farmers/me', {
    method: 'PUT',
    body: JSON.stringify({ crop, expected_quantity: quantity }),
  });
}
