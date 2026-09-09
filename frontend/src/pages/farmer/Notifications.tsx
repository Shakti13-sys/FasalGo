import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Clock, AlertTriangle, Truck, Wallet, Info, CheckCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import type { NotificationItem } from '@/types';

const iconMap: Record<NotificationItem['type'], { icon: typeof Bell; color: string; bg: string }> = {
  turn: { icon: Clock, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-950/40' },
  queue: { icon: AlertTriangle, color: 'text-secondary-600 dark:text-secondary-400', bg: 'bg-secondary-50 dark:bg-secondary-950/40' },
  procurement: { icon: Truck, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/40' },
  payment: { icon: Wallet, color: 'text-success-600 dark:text-success-400', bg: 'bg-success-50 dark:bg-success-950/40' },
  system: { icon: Info, color: 'text-ink-500 dark:text-ink-400', bg: 'bg-ink-50 dark:bg-ink-800' },
};

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead, showToast } = useApp();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAll = () => {
    markAllNotificationsRead();
    showToast('success', 'All notifications marked as read.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h1 className="text-2xl font-display font-bold text-ink-900 dark:text-white">Notifications</h1>
            {unreadCount > 0 && <Badge variant="danger">{unreadCount} new</Badge>}
          </div>
          <p className="text-ink-500 dark:text-ink-400">Stay updated on your token, queue, procurement, and payment.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAll}>
            <CheckCheck className="w-4 h-4" /> Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {notifications.map((n, i) => {
            const config = iconMap[n.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card
                  hover
                  onClick={() => markNotificationRead(n.id)}
                  className={n.read ? '' : 'ring-1 ring-primary-200 dark:ring-primary-800'}
                >
                  <div className="p-4 flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-bold ${n.read ? 'text-ink-700 dark:text-ink-400' : 'text-ink-900 dark:text-ink-100'}`}>{n.title}</p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 animate-pulse" />}
                      </div>
                      <p className="text-sm text-ink-500 dark:text-ink-400">{n.message}</p>
                      <p className="text-xs text-ink-500 dark:text-ink-400 mt-2">{n.timestamp}</p>
                    </div>
                    {!n.read && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markNotificationRead(n.id); }}
                        className="p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-500 dark:text-ink-400 hover:text-ink-600 dark:hover:text-ink-300"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {notifications.length === 0 && (
        <Card>
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-ink-300 dark:text-ink-700 mx-auto mb-3" />
            <p className="text-ink-500 dark:text-ink-400 font-semibold">No notifications yet</p>
            <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">You'll see updates about your token, queue, and payment here.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
