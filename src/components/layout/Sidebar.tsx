'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppStore, canAccess, ViewName, ACCESS_LABELS } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Users,
  FileText,
  Wallet,
  MessageSquare,
  Shirt,
  Shield,
  Globe,
  Menu,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
} from 'lucide-react';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  view: ViewName;
  path: string;
  requiredLevel?: string;
}

const menuItems: MenuItem[] = [
  { label: 'Tableau de bord', icon: <LayoutDashboard className="h-4 w-4" />, view: 'dashboard', path: '/dashboard' },
  { label: 'Membres', icon: <Users className="h-4 w-4" />, view: 'members', path: '/members', requiredLevel: 'MASTER' },
  { label: 'Documents', icon: <FileText className="h-4 w-4" />, view: 'documents', path: '/documents' },
  { label: 'Caisses', icon: <Wallet className="h-4 w-4" />, view: 'cash', path: '/cash', requiredLevel: 'MASTER' },
  { label: 'Messagerie', icon: <MessageSquare className="h-4 w-4" />, view: 'messages', path: '/messages' },
  { label: 'Uniformes', icon: <Shirt className="h-4 w-4" />, view: 'uniforms', path: '/uniforms' },
  { label: 'Notifications', icon: <Bell className="h-4 w-4" />, view: 'notifications', path: '/notifications' },
  { label: 'Administration', icon: <Shield className="h-4 w-4" />, view: 'admin', path: '/admin', requiredLevel: 'MAST_IN' },
];

const publicMenuItems: MenuItem[] = [
  { label: 'Espace Landa', icon: <Globe className="h-4 w-4" />, view: 'landa', path: '/landa' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { member, currentView, setView, logout } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const userLevel = member?.accessLevel || 'IGN';

  const filteredMenuItems = menuItems.filter(
    (item) => !item.requiredLevel || canAccess(userLevel, item.requiredLevel)
  );

  const handleNav = (item: MenuItem) => {
    setView(item.view);
    setMobileOpen(false);
    router.push(item.path);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-3 p-4">
        <img src="/feua-logo.png" alt="FEUA" className="h-10 w-10 object-contain drop-shadow-[0_0_12px_rgba(27,122,61,0.6)]" />
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="font-bold text-sm text-[var(--feua-gold)]">FEUA</span>
            <span className="text-xs text-white/60">BS-Lokossa</span>
          </motion.div>
        )}
      </Link>
      <Separator className="bg-white/10" />

      {/* Menu */}
      <ScrollArea className="flex-1 py-2">
        <div className="px-2 space-y-1">
          {filteredMenuItems.map((item, idx) => {
            const isActive = pathname === item.path || currentView === item.view;
            return (
              <div key={item.path}>
                {idx === 5 && <Separator className="my-2 bg-white/10" />}
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white font-medium border-l-[3px] border-l-[var(--feua-green)] rounded-l-none pl-5 shadow-[inset_0_0_12px_rgba(27,122,61,0.15)]'
                      : 'hover:bg-white/5 text-white/70 hover:text-white transition-colors'
                  }`}
                  onClick={() => handleNav(item)}
                  size={collapsed ? 'icon' : 'default'}
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              </div>
            );
          })}
          <Separator className="my-2 bg-white/10" />
          {publicMenuItems.map((item) => {
            const isActive = pathname === item.path || currentView === item.view;
            return (
              <Button
                key={item.path}
                variant="ghost"
                className={`w-full justify-start gap-3 transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white font-medium border-l-[3px] border-l-[var(--feua-gold)] rounded-l-none pl-5 shadow-[inset_0_0_12px_rgba(27,122,61,0.15)]'
                    : 'hover:bg-white/5 text-white/70 hover:text-white transition-colors'
                }`}
                onClick={() => handleNav(item)}
                size={collapsed ? 'icon' : 'default'}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      {/* User footer */}
      {member && (
        <>
          <Separator className="bg-white/10" />
          <div className={`p-4 bg-black/20 ${collapsed ? 'flex flex-col items-center' : ''}`}>
            {!collapsed ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-[var(--feua-green)] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {`${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate text-white">
                      {member.firstName} {member.lastName}
                    </span>
                    <span className="text-xs text-white/50">
                      {ACCESS_LABELS[member.accessLevel] || member.accessLevel}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Déconnexion" className="text-white/50 hover:text-white hover:bg-white/10">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Déconnexion" className="text-white/50 hover:text-white hover:bg-white/10">
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[85vw] max-w-[18rem] bg-gradient-to-b from-[var(--feua-dark)] via-emerald-950 to-[var(--feua-dark)] text-white border-r border-white/10">
            <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 256 }}
        className="hidden lg:block fixed left-0 top-0 bottom-0 z-40 bg-gradient-to-b from-[var(--feua-dark)] via-emerald-950 to-[var(--feua-dark)] text-white border-r border-white/10"
      >
        {sidebarContent}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-50 bg-background border rounded-full p-1 shadow-md hover:bg-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </motion.aside>
    </>
  );
}
