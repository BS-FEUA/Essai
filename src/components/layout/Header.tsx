'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, ACCESS_LABELS, silentFetch, type Notification } from '@/lib/store';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar';
import { Bell, User, LogOut, CheckCheck, BellOff, Moon, Sun } from 'lucide-react';

export function Header() {
  const { member, unreadCount, logout, notifications, setNotifications } = useAppStore();
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (!member?.id) return;

    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`notifications:${member.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications', filter: `member_id=eq.${member.id}`,
      }, ({ new: row }) => {
        const state = useAppStore.getState();
        if (state.notifications.some((notification) => notification.id === row.id)) return;
        const notification: Notification = {
          id: row.id,
          title: row.title,
          message: row.content,
          type: 'INFO',
          status: row.status,
          createdAt: row.created_at,
        };
        state.setNotifications([notification, ...state.notifications], state.unreadCount + 1);
      })
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [member?.id]);

  if (!member) return null;

  const initials = `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase();

  const roleColor: Record<string, string> = {
    CEO: 'bg-[var(--feua-gold)] text-white',
    MAST_IN: 'bg-[var(--feua-gold)] text-[var(--feua-dark)]',
    MAST: 'bg-[var(--feua-green)] text-white',
    MASTER: 'bg-[var(--feua-green)] text-white',
    MIX: 'bg-emerald-600 text-white',
    MIN: 'bg-emerald-400 text-[var(--feua-dark)]',
    AMC: 'bg-gray-500 text-white',
    IGN: 'bg-gray-400 text-white',
  };

  const handleMarkAllRead = async () => {
    try {
      await silentFetch('/api/notifications', { method: 'PUT', body: JSON.stringify({ markAll: true }) });
      setNotifications(notifications.map((n) => ({ ...n, status: 'READ' })), 0);
    } catch { /* ignore */ }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b shadow-sm bg-background/80 backdrop-blur-sm px-3 py-3 sm:px-4 lg:px-6 flex flex-wrap items-center justify-between gap-2">
      {/* Left spacer for mobile hamburger */}
      <div className="lg:hidden w-10" />

      {/* Notifications */}
      <Popover open={notifOpen} onOpenChange={setNotifOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'animate-bell-bounce' : ''}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium ring-2 ring-background">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={8} collisionPadding={8} className="w-[min(24rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border bg-background p-0 shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
            <span className="font-semibold text-sm">Notifications <span className="text-muted-foreground">({notifications.length})</span></span>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-auto shrink-0 p-1 text-xs text-[var(--feua-green)] hover:text-[var(--feua-green)]" onClick={handleMarkAllRead}>
                <CheckCheck className="mr-1 h-3 w-3" /><span className="hidden sm:inline">Tout marquer comme lu</span><span className="sm:hidden">Tout lire</span>
              </Button>
            )}
          </div>
          <div className="max-h-[min(65dvh,24rem)] overflow-y-auto overscroll-contain">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <BellOff className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">Aucune notification</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((n: Notification) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3.5 transition-colors hover:bg-muted/60 ${n.status !== 'READ' ? 'border-l-[3px] border-l-[var(--feua-green)] bg-[var(--feua-green-light)]/30' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 break-words text-sm font-semibold leading-5">{n.title}</p>
                      {n.status !== 'READ' && <span className="h-2 w-2 rounded-full bg-[var(--feua-green)] mt-1.5 flex-shrink-0" />}
                    </div>
                    <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {new Date(n.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border-t">
            <button
              onClick={() => { setNotifOpen(false); router.push('/notifications'); }}
              className="w-full px-4 py-3 text-center text-xs font-semibold text-[var(--feua-green)] transition-colors hover:bg-muted/50"
            >
              Voir toutes les notifications <span aria-hidden="true">→</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Dark mode toggle */}
      <Button variant="ghost" size="icon" onClick={() => document.documentElement.classList.toggle('dark')}>
        <Sun className="h-5 w-5 block dark:hidden" />
        <Moon className="h-5 w-5 hidden dark:block" />
      </Button>

      {/* User info */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-medium">
            {member.firstName} {member.lastName}
          </span>
          <Badge variant="outline" className={`text-xs ${roleColor[member.accessLevel] || ''}`}>
            {ACCESS_LABELS[member.accessLevel] || member.accessLevel}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="rounded-full p-0">
              <Avatar className="h-9 w-9 ring-2 ring-[var(--feua-green)] ring-offset-2 ring-offset-background">
                <AvatarFallback className="bg-[var(--feua-green)] text-white text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push('/dashboard')}>
              <User className="mr-2 h-4 w-4" />
              Mon profil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
