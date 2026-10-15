'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, canAccess, ACCESS_LABELS, apiFetch, cachedApiFetch } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Shield, Megaphone, BarChart3, Clock, ChevronLeft, ChevronRight, Loader2,
  Users, ShoppingBag, Trash2, CheckCircle2, XCircle, Edit, AlertTriangle, Eye
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export function AdminView() {
  const { member } = useAppStore();
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [logTotal, setLogTotal] = useState(0);
  const [logPage, setLogPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');

  // Announcements state
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [annOpen, setAnnOpen] = useState(false);
  const [editAnnId, setEditAnnId] = useState<string | null>(null);
  const [annForm, setAnnForm] = useState({ title: '', content: '', isUrgent: false });
  const [annLoading, setAnnLoading] = useState(false);

  // Members state
  const [members, setMembers] = useState<any[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState('');
  const [memberLoading, setMemberLoading] = useState(false);
  const [deleteConfirmMember, setDeleteConfirmMember] = useState<any>(null);

  // Uniform orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState<any>(null);

  // Load Overview
  const loadOverview = useCallback(async () => {
    try {
      const o = await cachedApiFetch<any>('/api/admin?section=overview');
      setOverview(o);
    } catch { /* ignore */ }
  }, []);

  // Load Announcements
  const loadAnnouncements = useCallback(async () => {
    try {
      const data = await cachedApiFetch<{ announcements: any[] }>('/api/announcements');
      setAnnouncements(data.announcements || []);
    } catch { /* ignore */ }
  }, []);

  // Load Members
  const loadMembers = useCallback(async () => {
    setMemberLoading(true);
    try {
      const params = new URLSearchParams({ page: '1', limit: '50' });
      if (memberSearch) params.set('search', memberSearch);
      if (memberStatusFilter) params.set('status', memberStatusFilter);
      const data = await cachedApiFetch<{ members: any[] }>(`/api/members?${params}`);
      setMembers(data.members || []);
    } catch { /* ignore */ } finally { setMemberLoading(false); }
  }, [memberSearch, memberStatusFilter]);

  // Load Uniform Orders
  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const data = await cachedApiFetch<{ orders: any[] }>('/api/uniforms?limit=50');
      setOrders(data.orders || []);
    } catch { /* ignore */ } finally { setOrdersLoading(false); }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadOverview();
      setLoading(false);
    };
    init();
  }, [loadOverview]);

  // Tab switch loading
  useEffect(() => {
    let mounted = true;
    Promise.resolve().then(() => {
      if (!mounted) return;
      if (tab === 'announcements') loadAnnouncements();
      if (tab === 'members') loadMembers();
      if (tab === 'uniforms') loadOrders();
    });
    return () => { mounted = false; };
  }, [tab, loadAnnouncements, loadMembers, loadOrders]);

  // Audit log loading
  useEffect(() => {
    if (tab !== 'audit') return;
    const loadLogs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(logPage), limit: '20' });
        if (filterAction) params.set('action', filterAction);
        const data = await apiFetch<{ logs: any[]; total: number }>(`/api/admin?section=audit&${params}`);
        setLogs(data.logs || []);
        setLogTotal(data.total || 0);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    loadLogs();
  }, [tab, logPage, filterAction]);

  // Announcement actions
  const handleSaveAnn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnLoading(true);
    try {
      if (editAnnId) {
        await apiFetch('/api/announcements', {
          method: 'PUT',
          body: JSON.stringify({ id: editAnnId, ...annForm }),
        });
      } else {
        await apiFetch('/api/announcements', {
          method: 'POST',
          body: JSON.stringify(annForm),
        });
      }
      setAnnOpen(false);
      setEditAnnId(null);
      setAnnForm({ title: '', content: '', isUrgent: false });
      await loadAnnouncements();
      await loadOverview();
    } catch { /* ignore */ } finally { setAnnLoading(false); }
  };

  const handleToggleAnnActive = async (id: string, currentActive: boolean) => {
    try {
      await apiFetch('/api/announcements', {
        method: 'PUT',
        body: JSON.stringify({ id, isActive: !currentActive }),
      });
      await loadAnnouncements();
    } catch { /* ignore */ }
  };

  const handleDeleteAnn = async (id: string) => {
    try {
      await apiFetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
      await loadAnnouncements();
    } catch { /* ignore */ }
  };

  // Member actions
  const handleUpdateMemberStatus = async (memberId: string, status: string, accessLevel?: string) => {
    try {
      await apiFetch('/api/members', {
        method: 'PUT',
        body: JSON.stringify({ memberId, status, accessLevel }),
      });
      await loadMembers();
      await loadOverview();
    } catch { /* ignore */ }
  };

  const handleDeleteMember = async () => {
    if (!deleteConfirmMember) return;
    try {
      await apiFetch(`/api/members?id=${deleteConfirmMember.id}`, { method: 'DELETE' });
      setDeleteConfirmMember(null);
      await loadMembers();
      await loadOverview();
    } catch { /* ignore */ }
  };

  // Uniform order actions
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await apiFetch('/api/uniforms', {
        method: 'PUT',
        body: JSON.stringify({ orderId, status }),
      });
      await loadOrders();
      await loadOverview();
    } catch { /* ignore */ }
  };

  const handleDeleteOrder = async () => {
    if (!deleteConfirmOrder) return;
    try {
      await apiFetch(`/api/uniforms?id=${deleteConfirmOrder.id}`, { method: 'DELETE' });
      setDeleteConfirmOrder(null);
      await loadOrders();
      await loadOverview();
    } catch { /* ignore */ }
  };

  const PIE_COLORS = ['#1B7A3D', '#D4A017', '#15803D', '#a16207', '#166534', '#ca8a04', '#14532d', '#854d0e'];

  if (loading && tab === 'overview') {
    return (
      <motion.div {...pageVariants} className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">{[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="h-64" />
      </motion.div>
    );
  }

  const isCEO = member?.accessLevel === 'CEO';

  return (
    <motion.div {...pageVariants} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Shield className="h-7 w-7 text-amber-500 dark:text-amber-400" /> Administration & Audit
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Espace de gestion globale du Bureau Syndical BS-Lokossa (FEUA)</p>
        </div>
        {canAccess(member?.accessLevel || 'IGN', 'MAST') && (
          <Button
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold shadow-lg shadow-amber-950/40 rounded-xl"
            onClick={() => {
              setEditAnnId(null);
              setAnnForm({ title: '', content: '', isUrgent: false });
              setAnnOpen(true);
            }}
          >
            <Megaphone className="mr-2 h-4 w-4" /> Publier une annonce
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="bg-slate-900/80 p-1.5 rounded-2xl border border-emerald-500/30 shadow-inner flex flex-wrap gap-1">
          <TabsTrigger value="overview" className="rounded-xl text-xs font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4 mr-1.5" /> Vue d&apos;ensemble
          </TabsTrigger>
          <TabsTrigger value="announcements" className="rounded-xl text-xs font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <Megaphone className="h-4 w-4 mr-1.5" /> Annonces
          </TabsTrigger>
          <TabsTrigger value="members" className="rounded-xl text-xs font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-1.5" /> Membres & Inscriptions
          </TabsTrigger>
          <TabsTrigger value="uniforms" className="rounded-xl text-xs font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <ShoppingBag className="h-4 w-4 mr-1.5" /> Uniformes
          </TabsTrigger>
          <TabsTrigger value="audit" className="rounded-xl text-xs font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <Clock className="h-4 w-4 mr-1.5" /> Mémoire H (Audit)
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Dialog for Announcement Creation/Editing */}
      <Dialog open={annOpen} onOpenChange={setAnnOpen}>
        <DialogContent className="bg-slate-900 border border-emerald-500/30 text-white rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-300">
              {editAnnId ? 'Éditer l\'annonce' : 'Créer une nouvelle annonce'}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Les annonces publiées sont immédiatement visibles par tous les membres du syndicat.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAnn} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-300">Titre de l'annonce *</Label>
              <Input
                value={annForm.title}
                onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                required
                placeholder="Ex: Assemblée Générale du Bureau..."
                className="bg-slate-950/80 border-slate-700 text-white rounded-xl text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-300">Contenu *</Label>
              <Textarea
                value={annForm.content}
                onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                required
                placeholder="Détails du communiqué..."
                rows={4}
                className="bg-slate-950/80 border-slate-700 text-white rounded-xl text-xs"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-amber-500/20">
              <div>
                <Label className="text-xs font-bold text-amber-300">Marquer comme urgente</Label>
                <p className="text-[10px] text-slate-400">Met en valeur le communiqué avec un badge prioritaire.</p>
              </div>
              <Switch
                checked={annForm.isUrgent}
                onCheckedChange={(c) => setAnnForm({ ...annForm, isUrgent: c })}
              />
            </div>
            <DialogFooter className="mt-4 gap-2">
              <Button variant="outline" type="button" onClick={() => setAnnOpen(false)} className="border-slate-700 text-slate-300 rounded-xl text-xs">
                Annuler
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs" disabled={annLoading}>
                {annLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editAnnId ? 'Enregistrer' : 'Publier'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Member Confirmation Modal */}
      <Dialog open={Boolean(deleteConfirmMember)} onOpenChange={(open) => !open && setDeleteConfirmMember(null)}>
        <DialogContent className="bg-slate-900 border border-red-500/40 text-white rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" /> Désactivation et anonymisation CEO
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-xs mt-2">
              Voulez-vous désactiver le compte et anonymiser le profil du membre{' '}
              <strong className="text-white">{deleteConfirmMember?.firstName} {deleteConfirmMember?.lastName}</strong> ({deleteConfirmMember?.email}) ?
              <br />
              <span className="text-red-300 text-[11px]">La connexion sera bloquée et les données personnelles supprimées. Les références historiques et le journal d'audit immuable seront conservés.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmMember(null)} className="border-slate-700 text-slate-300 rounded-xl text-xs">
              Annuler
            </Button>
            <Button onClick={handleDeleteMember} className="bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs">
              Désactiver et anonymiser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Order Confirmation Modal */}
      <Dialog open={Boolean(deleteConfirmOrder)} onOpenChange={(open) => !open && setDeleteConfirmOrder(null)}>
        <DialogContent className="bg-slate-900 border border-red-500/40 text-white rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" /> Suppression de commande CEO
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-xs mt-2">
              Voulez-vous annuler et supprimer la commande d'uniforme #{deleteConfirmOrder?.id?.slice(0, 8)} du membre{' '}
              <strong className="text-white">{deleteConfirmOrder?.member?.firstName} {deleteConfirmOrder?.member?.lastName}</strong> ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmOrder(null)} className="border-slate-700 text-slate-300 rounded-xl text-xs">
              Annuler
            </Button>
            <Button onClick={handleDeleteOrder} className="bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs">
              Supprimer la commande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TAB 1: OVERVIEW */}
      {tab === 'overview' && overview && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Statistiques Globales</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="bg-card dark:bg-slate-900/80 backdrop-blur-xl border border-[var(--feua-green)]/30 dark:border-emerald-500/30 shadow-xl hover:border-[var(--feua-green)]/60 dark:hover:border-emerald-400 transition-all">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Total membres</p>
                  <p className="text-2xl sm:text-3xl font-black text-[var(--feua-green)] dark:text-emerald-400">{overview.totalMembers}</p>
                </CardContent>
              </Card>
              <Card className="bg-card dark:bg-slate-900/80 backdrop-blur-xl border border-[var(--feua-green)]/30 dark:border-emerald-500/30 shadow-xl hover:border-[var(--feua-green)]/60 dark:hover:border-emerald-400 transition-all">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Membres actifs</p>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-300">{overview.activeMembers}</p>
                </CardContent>
              </Card>
              <Card className="bg-card dark:bg-slate-900/80 backdrop-blur-xl border border-[var(--feua-gold)]/40 dark:border-amber-500/40 shadow-xl hover:border-[var(--feua-gold)]/60 dark:hover:border-amber-400 transition-all">
                <CardContent className="p-4">
                  <p className="text-xs text-[var(--feua-gold)] dark:text-amber-400 font-semibold">En attente de validation</p>
                  <p className="text-2xl sm:text-3xl font-black text-[var(--feua-gold)] dark:text-amber-300">{overview.pendingMembers}</p>
                </CardContent>
              </Card>
              <Card className="bg-card dark:bg-slate-900/80 backdrop-blur-xl border border-[var(--feua-green)]/30 dark:border-emerald-500/30 shadow-xl hover:border-[var(--feua-green)]/60 dark:hover:border-emerald-400 transition-all">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Solde caisses</p>
                  <p className="text-2xl sm:text-3xl font-black text-[var(--feua-gold)] dark:text-amber-400">{(overview.totalBalance || 0).toLocaleString()} <span className="text-xs text-muted-foreground dark:text-slate-400 font-normal">FCFA</span></p>
                </CardContent>
              </Card>
              <Card className="bg-card dark:bg-slate-900/80 backdrop-blur-xl border border-[var(--feua-green)]/30 dark:border-emerald-500/30 shadow-xl hover:border-[var(--feua-green)]/60 dark:hover:border-emerald-400 transition-all">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Transactions validées</p>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-300">{overview.totalTransactions}</p>
                </CardContent>
              </Card>
              <Card className="bg-card dark:bg-slate-900/80 backdrop-blur-xl border border-[var(--feua-gold)]/30 dark:border-amber-500/30 shadow-xl hover:border-[var(--feua-gold)]/60 dark:hover:border-amber-400 transition-all">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Commandes d'uniformes</p>
                  <p className="text-2xl sm:text-3xl font-black text-[var(--feua-gold)] dark:text-amber-300">{overview.totalOrders}</p>
                </CardContent>
              </Card>
              <Card className="bg-card dark:bg-slate-900/80 backdrop-blur-xl border border-[var(--feua-gold)]/40 dark:border-amber-500/40 shadow-xl hover:border-[var(--feua-gold)]/60 dark:hover:border-amber-400 transition-all">
                <CardContent className="p-4">
                  <p className="text-xs text-[var(--feua-gold)] dark:text-amber-300">Commandes en attente</p>
                  <p className="text-2xl sm:text-3xl font-black text-[var(--feua-gold)] dark:text-amber-400">{overview.pendingOrders}</p>
                </CardContent>
              </Card>
              <Card className="bg-card dark:bg-slate-900/80 backdrop-blur-xl border border-[var(--feua-green)]/30 dark:border-emerald-500/30 shadow-xl hover:border-[var(--feua-green)]/60 dark:hover:border-emerald-400 transition-all">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Connexions (7j)</p>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-300">{overview.recentLogins}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card dark:bg-slate-900/80 backdrop-blur-xl border border-[var(--feua-green)]/30 dark:border-emerald-500/30 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-[var(--feua-green)] dark:text-emerald-300">Répartition par niveau d&apos;accès</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(overview.membersByLevel || []).map((m: any) => ({ name: ACCESS_LABELS[m.accessLevel] || m.accessLevel, count: m._count }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#10b981', color: '#f8fafc' }} />
                      <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card dark:bg-slate-900/80 backdrop-blur-xl border border-[var(--feua-green)]/30 dark:border-emerald-500/30 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-[var(--feua-gold)] dark:text-amber-300">Répartition par institution</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={(overview.membersByInstitution || []).map((m: any) => ({ name: m.institution || 'Autre', value: m._count }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {(overview.membersByInstitution || []).map((_: any, index: number) => (
                          <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#f59e0b', color: '#f8fafc' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: ANNOUNCEMENTS */}
      {tab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--feua-gold)] dark:text-amber-300 uppercase tracking-wider">Gestion des Communiqués & Publications</h2>
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
              onClick={() => { setEditAnnId(null); setAnnForm({ title: '', content: '', isUrgent: false }); setAnnOpen(true); }}
            >
              <Megaphone className="mr-1.5 h-3.5 w-3.5" /> Nouvelle Annonce
            </Button>
          </div>

          <Card className="bg-card dark:bg-slate-900/80 backdrop-blur-xl border border-[var(--feua-green)]/30 dark:border-emerald-500/30 shadow-xl">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50 dark:bg-slate-950/60">
                  <TableRow className="dark:border-slate-800">
                    <TableHead className="dark:text-slate-300">Titre</TableHead>
                    <TableHead className="dark:text-slate-300">Statut Urgence</TableHead>
                    <TableHead className="dark:text-slate-300">Visibilité</TableHead>
                    <TableHead className="dark:text-slate-300">Date</TableHead>
                    <TableHead className="text-right dark:text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground dark:text-slate-400 text-xs">
                        Aucun communiqué publié. Cliquez sur "Nouvelle Annonce" pour en créer une.
                      </TableCell>
                    </TableRow>
                  ) : (
                    announcements.map((ann) => (
                      <TableRow key={ann.id} className="dark:border-slate-800/60 hover:bg-muted/50 dark:hover:bg-slate-800/40">
                        <TableCell className="font-bold max-w-xs truncate">
                          {ann.title}
                          <p className="text-[11px] text-muted-foreground dark:text-slate-400 truncate font-normal">{ann.content}</p>
                        </TableCell>
                        <TableCell>
                          {ann.isUrgent ? (
                            <Badge className="bg-red-500/20 text-red-600 dark:text-red-300 border-red-500/40 text-[10px]">Urgente</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground text-[10px]">Normale</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={ann.isActive}
                            onCheckedChange={() => handleToggleAnnActive(ann.id, ann.isActive)}
                          />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground dark:text-slate-400">
                          {new Date(ann.createdAt).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-[var(--feua-gold)] dark:text-amber-300 hover:bg-[var(--feua-gold)]/10 dark:hover:bg-amber-500/20"
                            onClick={() => {
                              setEditAnnId(ann.id);
                              setAnnForm({ title: ann.title, content: ann.content, isUrgent: ann.isUrgent });
                              setAnnOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-500 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20"
                            onClick={() => handleDeleteAnn(ann.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: MEMBERS & REGISTRATION VALIDATION */}
      {tab === 'members' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <h2 className="text-sm font-bold text-[var(--feua-green)] dark:text-emerald-400 uppercase tracking-wider">Gestion des Membres &amp; Inscriptions</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Rechercher nom, email..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="rounded-xl text-xs w-48"
              />
              <Select value={memberStatusFilter} onValueChange={(v) => setMemberStatusFilter(v === 'ALL' ? '' : v)}>
                <SelectTrigger className="w-40 text-xs rounded-xl">
                  <SelectValue placeholder="Tous statuts" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="ALL">Tous les statuts</SelectItem>
                  <SelectItem value="PENDING_VALIDATION">En attente validation</SelectItem>
                  <SelectItem value="ACTIVE">Actif</SelectItem>
                  <SelectItem value="SUSPENDED">Suspendu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="bg-card dark:bg-slate-900/80 backdrop-blur-xl border border-[var(--feua-green)]/30 dark:border-emerald-500/30 shadow-xl">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50 dark:bg-slate-950/60">
                  <TableRow className="dark:border-slate-800">
                    <TableHead className="dark:text-slate-300">Membre</TableHead>
                    <TableHead className="dark:text-slate-300">Niveau d'accès</TableHead>
                    <TableHead className="dark:text-slate-300">Statut</TableHead>
                    <TableHead className="dark:text-slate-300">Filière / Inst.</TableHead>
                    <TableHead className="text-right dark:text-slate-300">Actions d'administration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberLoading ? (
                    [1, 2, 3].map((i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground dark:text-slate-400 text-xs">
                        Aucun membre trouvé.
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((m) => (
                      <TableRow key={m.id} className="dark:border-slate-800/60 hover:bg-muted/50 dark:hover:bg-slate-800/40">
                        <TableCell className="text-xs">
                          <p className="font-bold">{m.firstName} {m.lastName}</p>
                          <p className="text-[10px] text-muted-foreground dark:text-slate-400">{m.email} • {m.matricule}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-[var(--feua-green)]/20 text-[var(--feua-green)] dark:text-emerald-300 border-[var(--feua-green)]/40 dark:border-emerald-500/40 text-[10px]">
                            {ACCESS_LABELS[m.accessLevel] || m.accessLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {m.status === 'PENDING_VALIDATION' ? (
                            <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 text-[10px] animate-pulse">
                              En attente
                            </Badge>
                          ) : m.status === 'ACTIVE' ? (
                            <Badge className="bg-[var(--feua-green)]/20 text-[var(--feua-green)] dark:text-emerald-300 border-[var(--feua-green)]/40 dark:border-emerald-500/40 text-[10px]">
                              Actif
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground text-[10px]">
                              {m.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground dark:text-slate-400">
                          {m.filiere || '-'}
                          <p className="text-[10px] text-muted-foreground/70 dark:text-slate-500">{m.institution}</p>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          {m.status === 'PENDING_VALIDATION' && isCEO && (
                            <Button
                              size="sm"
                              className="bg-[var(--feua-green)] hover:bg-[var(--feua-green)]/90 text-white font-bold text-[10px] h-7 px-2 rounded-lg"
                              onClick={() => handleUpdateMemberStatus(m.id, 'ACTIVE')}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Valider
                            </Button>
                          )}
                          {m.status === 'ACTIVE' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-[10px] h-7 px-2 rounded-lg"
                              onClick={() => handleUpdateMemberStatus(m.id, 'SUSPENDED')}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1 text-amber-500" /> Suspendre
                            </Button>
                          )}
                          {m.status === 'SUSPENDED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-[10px] h-7 px-2 rounded-lg"
                              onClick={() => handleUpdateMemberStatus(m.id, 'ACTIVE')}
                            >
                              Réactiver
                            </Button>
                          )}
                          {isCEO && m.id !== member?.id && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-red-500 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20"
                              onClick={() => setDeleteConfirmMember(m)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: UNIFORM ORDERS */}
      {tab === 'uniforms' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[var(--feua-gold)] dark:text-amber-300 uppercase tracking-wider">Gestion des Commandes d&apos;Uniformes</h2>
          <Card className="bg-card dark:bg-slate-900/80 backdrop-blur-xl border border-[var(--feua-green)]/30 dark:border-emerald-500/30 shadow-xl">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50 dark:bg-slate-950/60">
                  <TableRow className="dark:border-slate-800">
                    <TableHead className="dark:text-slate-300">Membre</TableHead>
                    <TableHead className="dark:text-slate-300">Cycle / Taille / Qté</TableHead>
                    <TableHead className="dark:text-slate-300">Montant Total</TableHead>
                    <TableHead className="dark:text-slate-300">Statut Validation</TableHead>
                    <TableHead className="text-right dark:text-slate-300">Actions Validation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersLoading ? (
                    [1, 2].map((i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground dark:text-slate-400 text-xs">
                        Aucune commande d&apos;uniforme enregistrée.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((ord) => (
                      <TableRow key={ord.id} className="dark:border-slate-800/60 hover:bg-muted/50 dark:hover:bg-slate-800/40">
                        <TableCell className="text-xs font-bold">
                          {ord.member?.firstName} {ord.member?.lastName}
                          <p className="text-[10px] text-muted-foreground dark:text-slate-400">{ord.member?.matricule} • {ord.member?.phone}</p>
                        </TableCell>
                        <TableCell className="text-xs dark:text-slate-300">
                          Cycle {ord.cycle} • Taille {ord.taille} • Qté {ord.quantity}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-[var(--feua-gold)] dark:text-amber-400">
                          {ord.totalAmount?.toLocaleString()} FCFA
                        </TableCell>
                        <TableCell>
                          {ord.status === 'EN_ATTENTE' && <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 text-[10px]">En Attente</Badge>}
                          {ord.status === 'VAL1' && <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 text-[10px]">Validé Niv. 1</Badge>}
                          {ord.status === 'VAL2' && <Badge className="bg-[var(--feua-green)]/20 text-[var(--feua-green)] dark:text-emerald-300 border-[var(--feua-green)]/40 text-[10px]">Validé Niv. 2</Badge>}
                          {ord.status === 'LIVRE' && <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/40 text-[10px]">Livré</Badge>}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          {ord.status === 'EN_ATTENTE' && (
                            <Button
                              size="sm"
                              className="bg-[var(--feua-green)] hover:bg-[var(--feua-green)]/90 text-white font-bold text-[10px] h-7 px-2 rounded-lg"
                              onClick={() => handleUpdateOrderStatus(ord.id, 'VAL1')}
                            >
                              Validation Niv. 1
                            </Button>
                          )}
                          {ord.status === 'VAL1' && (
                            <Button
                              size="sm"
                              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] h-7 px-2 rounded-lg"
                              onClick={() => handleUpdateOrderStatus(ord.id, 'VAL2')}
                            >
                              Validation Niv. 2
                            </Button>
                          )}
                          {ord.status === 'VAL2' && (
                            <Button
                              size="sm"
                              className="bg-[var(--feua-green)] hover:bg-[var(--feua-green)]/90 text-white font-bold text-[10px] h-7 px-2 rounded-lg"
                              onClick={() => handleUpdateOrderStatus(ord.id, 'LIVRE')}
                            >
                              Marquer Livré
                            </Button>
                          )}
                          {isCEO && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-red-500 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20"
                              onClick={() => setDeleteConfirmOrder(ord)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {tab === 'audit' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-muted-foreground dark:text-slate-300 uppercase tracking-wider">Mémoire H (Registre d&apos;Audit Immuable)</h2>
            <Select value={filterAction || 'all'} onValueChange={(v) => { setFilterAction(v === 'all' ? '' : v); setLogPage(1); }}>
              <SelectTrigger className="w-56 text-xs rounded-xl">
                <SelectValue placeholder="Toutes les actions" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">Toutes les actions</SelectItem>
                <SelectItem value="LOGIN">Connexion</SelectItem>
                <SelectItem value="ROLE_CHANGE">Modification de rôle</SelectItem>
                <SelectItem value="MEMBER_DELETE">Suppression membre</SelectItem>
                <SelectItem value="DOCUMENT_UPLOAD">Upload document</SelectItem>
                <SelectItem value="UNIFORM_ORDER">Commande uniforme</SelectItem>
                <SelectItem value="ANNOUNCEMENT_CREATE">Création annonce</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="bg-card dark:bg-slate-900/80 backdrop-blur-xl border border-[var(--feua-green)]/30 dark:border-emerald-500/30 shadow-xl">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50 dark:bg-slate-950/60">
                  <TableRow className="dark:border-slate-800">
                    <TableHead className="dark:text-slate-300">Date &amp; Heure</TableHead>
                    <TableHead className="dark:text-slate-300">Action</TableHead>
                    <TableHead className="dark:text-slate-300">Acteur</TableHead>
                    <TableHead className="dark:text-slate-300">Entité</TableHead>
                    <TableHead className="dark:text-slate-300">Détails</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [1, 2, 3, 4].map((i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground dark:text-slate-400 text-xs">
                        Aucun journal d&apos;audit trouvé.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id} className="dark:border-slate-800/60 hover:bg-muted/50 dark:hover:bg-slate-800/40 text-xs">
                        <TableCell className="text-muted-foreground dark:text-slate-400 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-[var(--feua-green)]/40 dark:border-emerald-500/40 text-[var(--feua-green)] dark:text-emerald-300 text-[10px]">
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="dark:text-slate-300">
                          {log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : 'Système'}
                          <p className="text-[10px] text-muted-foreground dark:text-slate-500">{log.actor?.matricule}</p>
                        </TableCell>
                        <TableCell className="text-muted-foreground dark:text-slate-400">
                          {log.entityType}
                        </TableCell>
                        <TableCell className="dark:text-slate-300 max-w-xs truncate">
                          {log.details}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between p-4 border-t dark:border-slate-800">
                <p className="text-xs text-muted-foreground dark:text-slate-400">{logTotal} entrée(s) trouvée(s)</p>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled={logPage <= 1} onClick={() => setLogPage(logPage - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" disabled={logPage * 20 >= logTotal} onClick={() => setLogPage(logPage + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
}
