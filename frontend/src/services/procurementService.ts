import type { Procurement } from '@/types';
import { mockProcurement } from '@/data/mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getProcurement(): Promise<Procurement> {
  await delay(600);
  return mockProcurement;
}

export async function advanceStage(procurementId: string): Promise<Procurement> {
  await delay(500);
  const stages = [...mockProcurement.stages];
  const currentIdx = stages.findIndex((s) => !s.completed);
  if (currentIdx >= 0) {
    const now = new Date();
    const timeStr = `${now.getHours() % 12}:${now.getMinutes().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
    stages[currentIdx] = { ...stages[currentIdx], completed: true, timestamp: timeStr };
  }
  return { ...mockProcurement, stages };
}
