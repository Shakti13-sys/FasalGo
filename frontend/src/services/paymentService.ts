import type { PaymentInfo } from '@/types';
import { apiFetch } from './api';

export async function getPaymentInfo(): Promise<PaymentInfo> {
  return await apiFetch<PaymentInfo>('/payment/active');
}
