'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppStore, canAccess, ACCESS_LABELS, apiFetch, cachedApiFetch, silentFetch } from '@/lib/store';
import { relativeTime, roleBadgeColor, statusBadge } from './view-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Users, FileText, Wallet, MessageSquare, Shirt, Shield,
  Package, CheckCircle, AlertTriangle, DollarSign, Activity,
  Lock, Loader2, Pencil, ChevronDown, Megaphone, FileUp,
} from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export function DashboardView() {
  const { member, setMember } = useAppStore();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '', institution: '', filiere: '', niveau: '' });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [pwOpen, setPwOpen] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const openEditProfile = () => {
    setEditForm({
      firstName: member?.firstName || '',
      lastName: member?.lastName || '',
      phone: member?.phone || '',
      institution: member?.institution || '',
      filiere: member?.filiere || '',
      niveau: member?.niveau || '',
    });
    setProfilePhoto(null);
    setProfilePhotoPreview(member?.photoUrl || '');
    setEditProfileOpen(true);
  };

  useEffect(() => {
    return () => {
      if (profilePhotoPreview.startsWith('blob:')) URL.revokeObjectURL(profilePhotoPreview);
    };
  }, [profilePhotoPreview]);

  const handleEditProfile = async () => {
    setEditLoading(true);
    try {
      let photoUrl = member?.photoUrl || null;
      if (profilePhoto) {
        const photoData = new FormData();
        photoData.set('photo', profilePhoto);
        const upload = await apiFetch<{ photoUrl: string }>('/api/members/photo', {
          method: 'POST',
          body: photoData,
        });
        photoUrl = upload.photoUrl;
      }

      await apiFetch('/api/members', {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      if (member) setMember({ ...member, ...editForm, photoUrl });
      setProfilePhoto(null);
      setEditProfileOpen(false);
    } catch { /* handled by apiFetch */ } finally { setEditLoading(false); }
  };

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    if (pwForm.newPassword.length < 8) {
      alert('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setPwLoading(true);
    try {
      await apiFetch('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'changePassword', ...pwForm }),
      });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwOpen(false);
    } catch { /* handled by apiFetch */ } finally { setPwLoading(false); }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [s, a, act] = await Promise.all([
          cachedApiFetch<any>('/api/stats'),
          cachedApiFetch<{ announcements: any[] }>('/api/announcements'),
          // silentFetch: no error toast for non-admin users (403 is expected)
          silentFetch<{ logs: any[]; total: number }>('/api/admin?section=audit&page=1&limit=10').then(d => d ?? { logs: [], total: 0 }),
        ]);
        setStats(s.stats);
        setAnnouncements(a.announcements);
        setRecentActivity(act.logs);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    load();
  }, []);

  const userLevel = member?.accessLevel || 'IGN';
  const initials = `${member?.firstName?.[0] || ''}${member?.lastName?.[0] || ''}`.toUpperCase();

  const quickActions = [
    { label: 'Documents', icon: <FileText className="h-5 w-5" />, path: '/documents', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400' },
    { label: 'Messagerie', icon: <MessageSquare className="h-5 w-5" />, path: '/messages', color: 'text-[var(--feua-gold)] bg-[var(--feua-gold-light)] dark:bg-amber-900/30 dark:text-amber-400' },
    { label: 'Uniformes', icon: <Shirt className="h-5 w-5" />, path: '/uniforms', color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400' },
  ];
  if (canAccess(userLevel, 'MASTER')) {
    quickActions.push({ label: 'Membres', icon: <Users className="h-5 w-5" />, path: '/members', color: 'text-[var(--feua-green)] bg-[var(--feua-green-light)] dark:bg-emerald-900/30 dark:text-emerald-400' });
    quickActions.push({ label: 'Caisses', icon: <Wallet className="h-5 w-5" />, path: '/cash', color: 'text-[var(--feua-gold)] bg-[var(--feua-gold-light)] dark:bg-amber-900/30 dark:text-amber-400' });
  }
  if (canAccess(userLevel, 'MAST_IN')) {
    quickActions.push({ label: 'Admin', icon: <Shield className="h-5 w-5" />, path: '/admin', color: 'text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400' });
  }

  return (
    <motion.div {...pageVariants} className="space-y-6">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl bg-gradient-to-r from-[var(--feua-green)] via-emerald-700 to-emerald-600 p-5 sm:p-6 text-white relative overflow-hidden shadow-[0_20px_50px_rgba(27,122,61,0.25)] animate-pop-in"
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-1/2 w-24 h-24 rounded-full bg-[var(--feua-gold)]/10 translate-y-12" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-white/40 shadow-lg">
            <AvatarImage src={member?.photoUrl || undefined} alt={`${member?.firstName} ${member?.lastName}`} />
            <AvatarFallback className="bg-white/20 text-white text-lg font-bold backdrop-blur-sm">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Bienvenue, {member?.firstName} !</h1>
            <p className="text-white/60 text-sm mt-1 capitalize">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-white/80 flex items-center gap-2 flex-wrap mt-1">
              <Badge className={`${roleBadgeColor[userLevel] || ''} border-0`}>{ACCESS_LABELS[userLevel] || userLevel}</Badge>
              <span>•</span>
              <span>{statusBadge[member?.status || '']?.label || member?.status}</span>
              {member?.institution && <><span>•</span><span>{member.institution}</span></>}
            </p>
          </div>
          <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 hover:text-white" onClick={openEditProfile}>
                <Pencil className="mr-2 h-4 w-4" />Modifier le profil
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Modifier le profil</DialogTitle><DialogDescription>Mettez à jour vos informations personnelles.</DialogDescription></DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border border-border">
                    <AvatarImage src={profilePhotoPreview || undefined} alt="Aperçu de la photo de profil" />
                    <AvatarFallback className="bg-[var(--feua-green)] text-white font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Label htmlFor="profile-photo">Photo de profil</Label>
                    <Input
                      id="profile-photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        setProfilePhoto(file);
                        setProfilePhotoPreview(URL.createObjectURL(file));
                      }}
                    />
                    <p className="text-xs text-muted-foreground">JPG, PNG ou WebP, 3 Mo maximum.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-2"><Label>Prénom</Label><Input value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} maxLength={80} required /></div>
                  <div className="space-y-2"><Label>Nom</Label><Input value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} maxLength={80} required /></div>
                </div>
                <div className="space-y-2"><Label>Téléphone</Label><Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} placeholder="+229 ..." /></div>
                <div className="space-y-2"><Label>Institution</Label><Input value={editForm.institution} onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })} placeholder="Université de Lokossa" /></div>
                <div className="space-y-2"><Label>Filière</Label><Input value={editForm.filiere} onChange={(e) => setEditForm({ ...editForm, filiere: e.target.value })} placeholder="Ex: Droit" /></div>
                <div className="space-y-2"><Label>Niveau</Label><Input value={editForm.niveau} onChange={(e) => setEditForm({ ...editForm, niveau: e.target.value })} placeholder="Ex: L1, L2, M1" /></div>
              </div>

              <Separator />

              <Collapsible open={pwOpen} onOpenChange={setPwOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between text-sm font-medium hover:bg-muted">
                    <span className="flex items-center gap-2"><Lock className="h-4 w-4" />Changer le mot de passe</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${pwOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-3">
                  <div className="space-y-2"><Label>Mot de passe actuel</Label><Input type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} placeholder="••••••••" /></div>
                  <div className="space-y-2"><Label>Nouveau mot de passe</Label><Input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} placeholder="Min. 8 caractères" /></div>
                  <div className="space-y-2"><Label>Confirmer le mot de passe</Label><Input type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} placeholder="••••••••" /></div>
                  <Button className="bg-[var(--feua-green)] hover:bg-[var(--feua-green)]/90 text-white" disabled={pwLoading} onClick={handleChangePassword}>
                    {pwLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Modifier le mot de passe
                  </Button>
                </CollapsibleContent>
              </Collapsible>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditProfileOpen(false)}>Annuler</Button>
                <Button className="bg-[var(--feua-green)] hover:bg-[var(--feua-green)]/90 text-white" disabled={editLoading} onClick={handleEditProfile}>
                  {editLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          {[
            { label: 'Documents', value: stats?.totalDocs, sub: 'Documents stockés', icon: <FileText className="h-10 w-10" />, bg: 'linear-gradient(135deg,#1B7A3D,#059669)', borderColor: '#D4A017', path: '/documents' },
            { label: 'Commandes', value: stats?.totalOrders, sub: 'Commandes en cours', icon: <Package className="h-10 w-10" />, bg: 'linear-gradient(135deg,#D4A017,#f59e0b)', borderColor: '#92400e', path: '/uniforms' },
            { label: 'Transactions', value: stats?.totalTx, sub: 'Opérations validées', icon: <DollarSign className="h-10 w-10" />, bg: 'linear-gradient(135deg,#065f46,#059669)', borderColor: 'rgba(255,255,255,0.3)', path: '/cash' },
            { label: 'Messages', value: stats?.unreadMsgs, sub: 'Messages à lire', icon: <MessageSquare className="h-10 w-10" />, bg: 'linear-gradient(135deg,#1B7A3D,#10b981)', borderColor: 'rgba(255,255,255,0.3)', path: '/messages' },
            { label: 'Membres actifs', value: stats?.activeMembers, sub: 'sur le réseau', icon: <Users className="h-10 w-10" />, bg: 'linear-gradient(135deg,#b45309,#f59e0b)', borderColor: 'rgba(255,255,255,0.3)', path: '/members' },
          ].map((card, i) => (
            <motion.div key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="cursor-pointer" onClick={() => router.push(card.path)}>
            <div
              className="relative rounded-xl border-l-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-white overflow-hidden animate-slide-in-bottom p-3 sm:p-4 flex flex-col justify-between min-h-[90px]"
              style={{ background: card.bg, borderLeftColor: card.borderColor }}
            >
                <div>
                  <p className="text-[11px] sm:text-xs opacity-80">{card.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold">{card.value !== undefined ? card.value : '—'}</p>
                  <p className="text-[10px] sm:text-[11px] opacity-60">{card.sub}</p>
                </div>
                <div className="absolute bottom-2 right-2 opacity-20">{card.icon}</div>
            </div>
            </motion.div>
          ))}
        </div>
        </motion.div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Accès rapide</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3">
          {quickActions.map((action) => (
            <motion.div key={action.path} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card className="group cursor-pointer hover:shadow-md hover:-translate-y-1 hover:ring-2 hover:ring-[var(--feua-gold)]/30 hover:ring-[var(--feua-gold)] transition-all glass-surface animate-slide-in-bottom" onClick={() => router.push(action.path)}>
                <CardContent className="p-3 flex flex-col items-center gap-1.5 text-center">
                  <div className={`p-2.5 rounded-full group-hover:scale-110 transition-transform ${action.color}`}>{action.icon}</div>
                  <span className="text-xs sm:text-sm font-medium">{action.label}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Announcements */}
        <Card className="animate-fade-in-up">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2"><Megaphone className="h-5 w-5 text-[var(--feua-green)]" />Annonces récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <div className="text-center py-6">
                <Megaphone className="h-8 w-8 mx-auto text-[var(--feua-gold)]/50 mb-2" />
                <p className="text-sm text-muted-foreground">Aucune annonce</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.slice(0, 3).map((a) => (
                  <div key={a.id} className={`p-3 rounded-lg bg-muted/50 dark:bg-muted/20 space-y-1 hover:bg-muted dark:hover:bg-muted/40 transition-colors cursor-pointer ${a.isUrgent ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-[var(--feua-green)]'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {a.isUrgent && <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />}
                        <span className="font-medium text-sm truncate">{a.title}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">{relativeTime(a.createdAt)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{a.content}</p>
                  </div>
                ))}
                <Link href="/admin" className="text-xs text-[var(--feua-gold)] hover:underline mt-1 block">Voir tout →</Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="animate-fade-in-up glass-surface" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2"><Activity className="h-5 w-5 text-[var(--feua-gold)]" />Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const filtered = recentActivity.filter((log: any) => log.action !== 'MEMBER_LOGIN');
              if (filtered.length === 0) {
                return (
                  <div className="text-center py-6">
                    <CheckCircle className="h-8 w-8 mx-auto text-[var(--feua-gold)]/50 mb-2" />
                    <p className="text-sm text-muted-foreground">Aucune activité récente</p>
                  </div>
                );
              }
              return (
                <div className="space-y-3">
                  {filtered.slice(0, 5).map((log: any) => {
                    const actorName = `${log.actor?.firstName || ''} ${log.actor?.lastName || ''}`.trim();
                    const actionMap: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
                      MEMBER_UPDATE: { icon: <Pencil className="h-4 w-4" />, label: 'Profil modifié', color: 'text-[var(--feua-gold)]' },
                      DOCUMENT_UPLOAD: { icon: <FileUp className="h-4 w-4" />, label: 'Document uploadé', color: 'text-emerald-600' },
                      CASH_TRANSACTION: { icon: <DollarSign className="h-4 w-4" />, label: 'Transaction caisse', color: 'text-[var(--feua-gold)]' },
                      UNIFORM_ORDER: { icon: <Shirt className="h-4 w-4" />, label: 'Commande uniforme', color: 'text-emerald-600' },
                      ANNOUNCEMENT_CREATE: { icon: <Megaphone className="h-4 w-4" />, label: 'Annonce publiée', color: 'text-[var(--feua-gold)]' },
                    };
                    const mapped = actionMap[log.action] || { icon: <Activity className="h-4 w-4" />, label: log.action, color: 'text-muted-foreground' };
                    return (
                      <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 dark:bg-muted/20 hover:bg-muted/80 dark:hover:bg-muted/40 transition-colors cursor-default">
                        <div className={mapped.color}>{mapped.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{actorName ? `${actorName} — ` : ''}{mapped.label}</p>
                          <p className="text-xs text-muted-foreground">{relativeTime(log.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
