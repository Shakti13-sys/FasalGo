import type { NotificationItem } from '@/types';
import { mockNotifications } from '@/data/mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getNotifications(): Promise<NotificationItem[]> {
  await delay(500);
  return mockNotifications;
}

export async function markAsRead(id: string): Promise<void> {
  await delay(200);
}

export async function markAllAsRead(): Promise<void> {
  await delay(300);
}
