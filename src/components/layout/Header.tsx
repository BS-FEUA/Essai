'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, ACCESS_LABELS, silentFetch, type Notification } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
        <PopoverContent align="end" className="w-[calc(100vw-2rem)] max-w-sm p-0 sm:w-80">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="text-xs text-[var(--feua-green)] hover:text-[var(--feua-green)] h-auto p-0" onClick={handleMarkAllRead}>
                <CheckCheck className="mr-1 h-3 w-3" />Tout marquer comme lu
              </Button>
            )}
          </div>
          <ScrollArea className="max-h-72">
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
                    className={`px-4 py-3 hover:bg-muted/50 transition-colors cursor-default ${n.status !== 'READ' ? 'border-l-[3px] border-l-[var(--feua-green)] bg-[var(--feua-green-light)]/30' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{n.title}</p>
                      {n.status !== 'READ' && <span className="h-2 w-2 rounded-full bg-[var(--feua-green)] mt-1.5 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {new Date(n.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <div className="border-t">
            <button
              onClick={() => { setNotifOpen(false); router.push('/notifications'); }}
              className="w-full py-2.5 text-xs text-center text-[var(--feua-green)] hover:bg-muted/50 transition-colors font-medium"
            >
              Voir toutes les notifications →
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
