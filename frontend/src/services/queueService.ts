import type { WaitTimePrediction } from '@/types';
import { mockWaitPrediction } from '@/data/mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getWaitPrediction(token: number): Promise<WaitTimePrediction> {
  await delay(800);
  return { ...mockWaitPrediction, token: token || mockWaitPrediction.token };
}

export async function getDynamicWait(
  token: number,
  currentlyServing: number,
): Promise<WaitTimePrediction> {
  await delay(400);
  const farmersAhead = mockWaitPrediction.token - currentlyServing;
  const estimatedWait = Math.max(3, farmersAhead * 2);
  const now = new Date();
  const turn = new Date(now.getTime() + estimatedWait * 60000);
  const hours = turn.getHours();
  const mins = turn.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return {
    token: token || mockWaitPrediction.token,
    currentlyServing,
    farmersAhead: Math.max(0, farmersAhead),
    estimatedWait,
    estimatedTurn: `${displayHour}:${mins.toString().padStart(2, '0')} ${ampm}`,
    confidence: Math.max(72, 95 - farmersAhead),
    status: estimatedWait < 20 ? 'ahead' : estimatedWait > 35 ? 'delayed' : 'on-track',
  };
}
