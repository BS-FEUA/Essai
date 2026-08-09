'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, apiFetch } from '@/lib/store';
import { relativeTime } from './view-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, BellOff, Check, CheckCheck, Info, AlertTriangle, Gift, Megaphone, Trash2 } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const notifIcon: Record<string, { icon: React.ReactNode; color: string }> = {
  INFO: { icon: <Info className="h-4 w-4" />, color: 'text-blue-400 bg-blue-400/10' },
  WARNING: { icon: <AlertTriangle className="h-4 w-4" />, color: 'text-amber-400 bg-amber-400/10' },
  SUCCESS: { icon: <Gift className="h-4 w-4" />, color: 'text-emerald-400 bg-emerald-400/10' },
  ANNOUNCEMENT: { icon: <Megaphone className="h-4 w-4" />, color: 'text-purple-400 bg-purple-400/10' },
};

export function NotificationsView() {
  const { setNotifications, unreadCount } = useAppStore();
  const [notifications, setLocalNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ notifications: any[]; unreadCount: number }>('/api/notifications');
      setLocalNotifications(data.notifications || []);
      setNotifications(data.notifications || [], data.unreadCount || 0);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [setNotifications]);

  useEffect(() => {
    let mounted = true;
    Promise.resolve().then(() => { if (mounted) load(); });
    return () => { mounted = false; };
  }, [load]);

  const handleMarkRead = async (id: string) => {
    try {
      await apiFetch('/api/notifications', {
        method: 'PUT',
        body: JSON.stringify({ id, status: 'READ' }),
      });
      setLocalNotifications((prev) => prev.map((n) => n.id === id ? { ...n, status: 'READ' } : n));
      setNotifications(
        notifications.map((n: any) => n.id === id ? { ...n, status: 'READ' } : n),
        Math.max(0, unreadCount - 1)
      );
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiFetch('/api/notifications', {
        method: 'PUT',
        body: JSON.stringify({ markAll: true }),
      });
      setLocalNotifications((prev) => prev.map((n) => ({ ...n, status: 'READ' })));
      setNotifications([], 0);
    } catch { /* ignore */ }
  };

  const unread = notifications.filter((n) => n.status === 'UNREAD').length;

  return (
    <motion.div {...pageVariants} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6 text-[var(--feua-gold)]" />
          Notifications
          {unread > 0 && (
            <Badge className="bg-red-500 text-white text-xs ml-1">{unread}</Badge>
          )}
        </h1>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <BellOff className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-semibold text-muted-foreground">Aucune notification</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Vous êtes à jour !</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notif) => {
                const iconConfig = notifIcon[notif.channel || 'INFO'] || notifIcon['INFO'];
                const isUnread = notif.status === 'UNREAD';
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors ${isUnread ? 'bg-[var(--feua-green-light)]/30 dark:bg-[var(--feua-green)]/5' : ''}`}
                  >
                    <div className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${iconConfig.color}`}>
                      {iconConfig.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`text-sm font-semibold ${isUnread ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.content}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{relativeTime(notif.createdAt)}</span>
                          {isUnread && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-[var(--feua-green)] hover:bg-[var(--feua-green-light)]"
                              onClick={() => handleMarkRead(notif.id)}
                              title="Marquer comme lu"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    {isUnread && (
                      <div className="flex-shrink-0 h-2.5 w-2.5 rounded-full bg-[var(--feua-gold)] mt-1 animate-pulse" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
