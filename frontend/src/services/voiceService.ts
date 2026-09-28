import type { VoiceResponse } from '@/types';
import { apiFetch } from './api';

export async function processVoiceQuery(query: string): Promise<VoiceResponse> {
  return await apiFetch<VoiceResponse>('/voice/query', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}

export const sampleQueries = [
  'Mera token kab aayega?',
  'Mere liye kaunsa centre best hai?',
  'Meri procurement ka status kya hai?',
  'Payment hua kya?',
  'How long is the wait in queue?',
];
