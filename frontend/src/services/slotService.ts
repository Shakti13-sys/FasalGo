import type { Token } from '@/types';
import { mockToken } from '@/data/mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function bookSlot(params: {
  centreId: string;
  centreName: string;
  date: string;
  time: string;
  crop: string;
  quantity: number;
}): Promise<Token> {
  await delay(1200);
  return {
    ...mockToken,
    id: 't' + Date.now(),
    centreId: params.centreId,
    centreName: params.centreName,
    date: params.date,
    time: params.time,
    crop: params.crop,
    quantity: params.quantity,
  };
}

export async function getToken(): Promise<Token> {
  await delay(400);
  return mockToken;
}
