import type { PaymentInfo } from '@/types';
import { mockPayment } from '@/data/mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getPaymentInfo(): Promise<PaymentInfo> {
  await delay(500);
  return mockPayment;
}
