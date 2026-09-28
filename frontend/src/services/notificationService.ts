import type { NotificationItem } from '@/types';
import { apiFetch } from './api';

export async function getNotifications(): Promise<NotificationItem[]> {
  return await apiFetch<NotificationItem[]>('/farmers/notifications');
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiFetch<void>('/farmers/notifications/read-all', {
    method: 'POST',
  });
}
