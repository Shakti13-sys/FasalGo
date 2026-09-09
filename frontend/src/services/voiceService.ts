import type { VoiceResponse } from '@/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const responses: { keywords: string[]; response: VoiceResponse }[] = [
  {
    keywords: ['token', 'kab', 'turn', 'when'],
    response: {
      query: 'When is my turn?',
      response: 'Your token #47 is expected in approximately 18 minutes. Currently serving token #32 at Centre A.',
      action: 'navigate:live-queue',
    },
  },
  {
    keywords: ['centre', 'best', 'kaunsa', 'recommend'],
    response: {
      query: 'Which centre is best?',
      response: 'Centre A is the best choice for you — 21 minutes wait, 3 of 4 counters active, and only 2.4 km away.',
      action: 'navigate:visit-planner',
    },
  },
  {
    keywords: ['procurement', 'status', 'kya', 'quality'],
    response: {
      query: 'What is my procurement status?',
      response: 'Your crop is currently undergoing quality verification at Centre A. Weighing has been completed.',
      action: 'navigate:procurement',
    },
  },
  {
    keywords: ['payment', 'paid', 'paisa', 'money', 'rupees'],
    response: {
      query: 'Has payment been done?',
      response: 'Yes, your payment of ₹42,500 has been completed. Transaction reference: TXN7845236901.',
      action: 'navigate:payment',
    },
  },
  {
    keywords: ['queue', 'wait', 'kitna', 'der'],
    response: {
      query: 'How long is the wait?',
      response: 'There are 15 farmers ahead of you. Estimated wait time is 31 minutes. You are on track.',
      action: 'navigate:live-queue',
    },
  },
];

export async function processVoiceQuery(query: string): Promise<VoiceResponse> {
  await delay(1500);
  const lowerQuery = query.toLowerCase();
  const match = responses.find((r) => r.keywords.some((k) => lowerQuery.includes(k.toLowerCase())));
  if (match) return match.response;
  return {
    query,
    response: 'I can help you with your token status, centre recommendations, procurement tracking, and payment information. Try asking about any of these.',
  };
}

export const sampleQueries = [
  'Mera token kab aayega?',
  'Mere liye kaunsa centre best hai?',
  'Meri procurement ka status kya hai?',
  'Payment hua kya?',
  'How long is the wait?',
];
