import type { Token } from '@/types';
import { apiFetch } from './api';

export async function bookSlot(params: {
  centreId: string;
  centreName: string;
  date: string;
  time: string;
  crop: string;
  quantity: number;
}): Promise<Token> {
  const token = await apiFetch<Token>('/tokens/generate', {
    method: 'POST',
    body: JSON.stringify({
      centre_id: params.centreId,
      centre_name: params.centreName,
      date: params.date,
      time: params.time,
      crop: params.crop,
      quantity: params.quantity,
    }),
  });
  return token;
}

export async function getToken(tokenId: string = 't-init-47'): Promise<Token> {
  return await apiFetch<Token>(`/tokens/${tokenId}`);
}

export async function getActiveToken(): Promise<Token> {
  return await apiFetch<Token>('/tokens/active/me');
}
