import type { WaitTimePrediction } from '@/types';
import { apiFetch, WS_BASE_URL } from './api';

export async function getWaitPrediction(
  token: number = 47,
  centreId: string = 'c1'
): Promise<WaitTimePrediction> {
  return await apiFetch<WaitTimePrediction>(`/queue/token/tkn-${token}?centre_id=${centreId}`);
}

export async function getDynamicWait(
  token: number,
  currentlyServing: number
): Promise<WaitTimePrediction> {
  const farmersAhead = Math.max(0, token - currentlyServing);
  const estimatedWait = Math.max(3, farmersAhead * 2);
  const now = new Date();
  const turn = new Date(now.getTime() + estimatedWait * 60000);
  const hours = turn.getHours();
  const mins = turn.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

  return {
    token,
    currentlyServing,
    farmersAhead,
    estimatedWait,
    estimatedTurn: `${displayHour}:${mins.toString().padStart(2, '0')} ${ampm}`,
    confidence: Math.max(72, 95 - farmersAhead),
    status: estimatedWait < 20 ? 'ahead' : estimatedWait > 35 ? 'delayed' : 'on-track',
  };
}

export async function advanceQueue(centreId: string = 'c1', incrementBy: number = 1): Promise<any> {
  return await apiFetch<any>(`/queue/${centreId}/advance`, {
    method: 'POST',
    body: JSON.stringify({ increment_by: incrementBy }),
  });
}

export async function simulateQueueSpike(centreId: string = 'c1', queueLength: number = 52): Promise<any> {
  return await apiFetch<any>(`/queue/${centreId}/spike?new_queue_length=${queueLength}`, {
    method: 'POST',
  });
}

export function connectQueueWebSocket(
  centreId: string,
  onMessage: (data: any) => void,
  onError?: (err: any) => void
): WebSocket {
  const wsUrl = `${WS_BASE_URL}/ws/queue/${centreId}`;
  const socket = new WebSocket(wsUrl);

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      console.warn('WebSocket message parse error:', e);
    }
  };

  socket.onerror = (err) => {
    console.warn(`WebSocket error on centre ${centreId}:`, err);
    if (onError) onError(err);
  };

  return socket;
}
