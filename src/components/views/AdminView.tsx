'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, canAccess, ACCESS_LABELS, apiFetch } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  // Announcement dialog
  const [annOpen, setAnnOpen] = useState(false);
  const [annForm, setAnnForm] = useState({ title: '', content: '', isUrgent: false });
  const [annLoading, setAnnLoading] = useState(false);

  const handleCreateAnn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnLoading(true);
    try {
      await apiFetch('/api/announcements', {
        method: 'POST',
        body: JSON.stringify(annForm),
      });
      setAnnOpen(false);
      setAnnForm({ title: '', content: '', isUrgent: false });
      const o = await apiFetch<any>('/api/admin?section=overview');
      setOverview(o);
    } catch { /* ignore */ } finally { setAnnLoading(false); }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [o] = await Promise.all([
          apiFetch<any>('/api/admin?section=overview'),
        ]);
        setOverview(o);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (tab !== 'audit') return;
    const loadLogs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(logPage), limit: '20' });
        if (filterAction) params.set('action', filterAction);
        const data = await apiFetch<{ logs: any[]; total: number }>(`/api/admin?section=audit&${params}`);
        setLogs(data.logs);
        setLogTotal(data.total);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    loadLogs();
  }, [tab, logPage, filterAction]);

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

  return (
    <motion.div {...pageVariants} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-[var(--feua-gold)]" />Administration</h1>
        {canAccess(member?.accessLevel || 'IGN', 'MAST') && (
          <Button className="bg-[var(--feua-gold)] hover:bg-[var(--feua-gold)]/90 text-[var(--feua-dark)] font-medium" onClick={() => setAnnOpen(true)}>
            <Megaphone className="mr-2 h-4 w-4" />Créer une annonce
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" />Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="audit"><Clock className="h-4 w-4 mr-1" />Mémoire H (Audit)</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Create announcement dialog */}
      <Dialog open={annOpen} onOpenChange={setAnnOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Créer une annonce</DialogTitle><DialogDescription>Les annonces sont visibles par tous les membres.</DialogDescription></DialogHeader>
          <form onSubmit={handleCreateAnn}>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Titre *</Label><Input value={annForm.title} onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })} required placeholder="Titre de l'annonce" /></div>
              <div className="space-y-2"><Label>Contenu *</Label><Textarea value={annForm.content} onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })} required placeholder="Détails de l'annonce..." rows={3} /></div>
              <div className="flex items-center justify-between">
                <Label>Marquer comme urgente</Label>
                <Switch checked={annForm.isUrgent} onCheckedChange={(c) => setAnnForm({ ...annForm, isUrgent: c })} />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" type="button" onClick={() => setAnnOpen(false)}>Annuler</Button>
              <Button type="submit" className="bg-[var(--feua-gold)] hover:bg-[var(--feua-gold)]/90 text-[var(--feua-dark)] font-medium" disabled={annLoading}>
                {annLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Publier
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {tab === 'overview' && overview && (
        <div className="space-y-6">
          {/* Stats grid */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Statistiques</h2>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="bg-gradient-to-br from-[var(--feua-green)] to-emerald-700 text-white shadow-lg hover:scale-[1.02] transition-transform">
                <CardContent className="p-3 sm:p-4"><p className="text-[11px] sm:text-xs opacity-80">Total membres</p><p className="text-2xl sm:text-3xl font-bold">{overview.totalMembers}</p></CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg hover:scale-[1.02] transition-transform">
                <CardContent className="p-3 sm:p-4"><p className="text-[11px] sm:text-xs opacity-80">Membres actifs</p><p className="text-2xl sm:text-3xl font-bold">{overview.activeMembers}</p></CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[var(--feua-gold)] to-amber-600 text-white shadow-lg hover:scale-[1.02] transition-transform">
                <CardContent className="p-3 sm:p-4"><p className="text-[11px] sm:text-xs opacity-80">En attente</p><p className="text-2xl sm:text-3xl font-bold">{overview.pendingMembers}</p></CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-800 to-[var(--feua-green)] text-white shadow-lg hover:scale-[1.02] transition-transform">
                <CardContent className="p-3 sm:p-4"><p className="text-[11px] sm:text-xs opacity-80">Total soldes</p><p className="text-2xl sm:text-3xl font-bold">{(overview.totalBalance || 0).toLocaleString()}</p><p className="text-[10px] opacity-60">FCFA</p></CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-lg hover:scale-[1.02] transition-transform">
                <CardContent className="p-3 sm:p-4"><p className="text-[11px] sm:text-xs opacity-80">Transactions</p><p className="text-2xl sm:text-3xl font-bold">{overview.totalTransactions}</p></CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[var(--feua-gold)] to-amber-700 text-white shadow-lg hover:scale-[1.02] transition-transform">
                <CardContent className="p-3 sm:p-4"><p className="text-[11px] sm:text-xs opacity-80">Commandes</p><p className="text-2xl sm:text-3xl font-bold">{overview.totalOrders}</p></CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[var(--feua-dark)] to-emerald-900 text-white shadow-lg hover:scale-[1.02] transition-transform">
                <CardContent className="p-3 sm:p-4"><p className="text-[11px] sm:text-xs opacity-80">Commandes en cours</p><p className="text-2xl sm:text-3xl font-bold">{overview.pendingOrders}</p></CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-500 to-[var(--feua-gold)] text-white shadow-lg hover:scale-[1.02] transition-transform">
                <CardContent className="p-3 sm:p-4"><p className="text-[11px] sm:text-xs opacity-80">Connexions (7j)</p><p className="text-2xl sm:text-3xl font-bold">{overview.recentLogins}</p></CardContent>
              </Card>
            </div>
            </motion.div>
          </div>

          {/* Charts */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Répartition</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader className="pb-2"><CardTitle className="text-base">Répartition par niveau</CardTitle></CardHeader>
                <CardContent className="p-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(overview.membersByLevel || []).map((m: any) => ({ name: ACCESS_LABELS[m.accessLevel] || m.accessLevel, count: m._count }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={11} />
                        <YAxis fontSize={11} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#1B7A3D" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardHeader className="pb-2"><CardTitle className="text-base">Répartition par institution</CardTitle></CardHeader>
                <CardContent className="p-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={(overview.membersByInstitution || []).map((m: any) => ({ name: m.institution || 'N/A', value: m._count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {(overview.membersByInstitution || []).map((_: any, index: number) => <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {tab === 'audit' && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Mémoire H (Audit)</h2>
          {/* Filters */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={filterAction || 'all'} onValueChange={(v) => { setFilterAction(v === 'all' ? '' : v); setLogPage(1); }}>
                  <SelectTrigger className="w-full sm:w-56"><SelectValue placeholder="Type d'action" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les actions</SelectItem>
                    <SelectItem value="MEMBER_LOGIN">Connexion</SelectItem>
                    <SelectItem value="MEMBER_UPDATE">Modification membre</SelectItem>
                    <SelectItem value="DOCUMENT_UPLOAD">Upload document</SelectItem>
                    <SelectItem value="CASH_TRANSACTION">Transaction caisse</SelectItem>
                    <SelectItem value="UNIFORM_ORDER">Commande uniforme</SelectItem>
                    <SelectItem value="ANNOUNCEMENT_CREATE">Annonce</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="tbody-row-hover">
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Acteur</TableHead>
                      <TableHead className="hidden sm:table-cell">Entité</TableHead>
                      <TableHead>Détails</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      [1, 2, 3, 4, 5].map(i => <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>)
                    ) : logs.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Shield className="h-10 w-10 text-[var(--feua-gold)]/30" />
                          <p className="text-muted-foreground">Aucune entrée d&apos;audit</p>
                        </div>
                      </TableCell></TableRow>
                    ) : logs.map((log, idx) => (
                      <TableRow key={log.id} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                        <TableCell className="text-sm">{new Date(log.createdAt).toLocaleString('fr-FR')}</TableCell>
                        <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                        <TableCell className="text-sm">
                          {log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : '-'}
                          <br />
                          <span className="text-xs text-muted-foreground">{log.actor?.matricule}</span>
                        </TableCell>
                        <TableCell className="text-sm hidden sm:table-cell">{log.entityType}{log.entityId ? ` (${log.entityId.slice(0, 8)}...)` : ''}</TableCell>
                        <TableCell className="text-sm max-w-xs truncate">{log.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">{logTotal} entrée(s)</p>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled={logPage <= 1} onClick={() => setLogPage(logPage - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" disabled={logPage * 20 >= logTotal} onClick={() => setLogPage(logPage + 1)}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
}
