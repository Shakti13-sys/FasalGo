import type { Procurement } from '@/types';
import { apiFetch } from './api';

export async function getProcurement(): Promise<Procurement> {
  return await apiFetch<Procurement>('/procurement/active');
}

export async function advanceStage(procurementId: string = 'prc-init-0891'): Promise<Procurement> {
  return await apiFetch<Procurement>(`/procurement/${procurementId}/advance-stage`, {
    method: 'POST',
  });
}
