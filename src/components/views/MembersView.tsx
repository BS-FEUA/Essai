'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, canAccess, ACCESS_LABELS, apiFetch } from '@/lib/store';
import { statusBadge, statusBadgeSoft } from './view-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Users, Search, ChevronLeft, ChevronRight, Download, Eye,
  MoreVertical, Shield, CheckCircle, Archive,
} from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export function MembersView() {
  const { member } = useAppStore();
  const [members, setMembers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10', search, accessLevel: filterLevel, status: filterStatus });
      const data = await apiFetch<any>(`/api/members?${params}`);
      setMembers(data.members);
      setTotal(data.total);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [page, search, filterLevel, filterStatus]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMembers();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadMembers]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [search, filterLevel, filterStatus]);

  const [updateDialog, setUpdateDialog] = useState<{ open: boolean; memberId: string; field: string; value: string }>({ open: false, memberId: '', field: '', value: '' });

  const handleUpdate = async () => {
    try {
      await apiFetch('/api/members', {
        method: 'PUT',
        body: JSON.stringify({
          memberId: updateDialog.memberId,
          ...(updateDialog.field === 'accessLevel' ? { accessLevel: updateDialog.value } : {}),
          ...(updateDialog.field === 'status' ? { status: updateDialog.value } : {}),
        }),
      });
      setUpdateDialog({ open: false, memberId: '', field: '', value: '' });
      loadMembers();
    } catch { /* ignore */ }
  };

  const handleExportCSV = async () => {
    try {
      const data = await apiFetch<{ members: any[] }>('/api/members?page=1&limit=999');
      const rows = data.members.map((m) => ({
        Matricule: m.matricule,
        Nom: m.lastName,
        Prénom: m.firstName,
        Email: m.email,
        "Niveau d'accès": ACCESS_LABELS[m.accessLevel] || m.accessLevel,
        Statut: statusBadge[m.status]?.label || m.status,
        Institution: m.institution || '',
        Filière: m.filiere || '',
      }));
      const headers = Object.keys(rows[0] || {});
      const csv = [headers.join(';'), ...rows.map((r) => headers.map((h) => r[h as keyof typeof r]).join(';'))].join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'membres_feua.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch { /* handled by apiFetch */ }
  };

  return (
    <motion.div {...pageVariants} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-[var(--feua-green)]" />Gestion des membres {total > 0 && <span className="text-base font-normal text-muted-foreground">({total} membres)</span>}</h1>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par nom, matricule, email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterLevel} onValueChange={(v) => setFilterLevel(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Niveau" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les niveaux</SelectItem>
                {Object.entries(ACCESS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="ACTIVE">Actif</SelectItem>
                <SelectItem value="PENDING_VALIDATION">En attente</SelectItem>
                <SelectItem value="ARCHIVED">Archivé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3"><Skeleton className="h-12 w-full" />{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table className="tbody-row-hover">
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Membre</TableHead>
                      <TableHead className="hidden sm:table-cell">Matricule</TableHead>
                      <TableHead className="hidden md:table-cell">Institution</TableHead>
                      <TableHead>Niveau</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-10 w-10 text-muted-foreground/30" />
                          <p className="text-muted-foreground">Aucun membre trouvé</p>
                        </div>
                      </TableCell></TableRow>
                    ) : members.map((m) => (
                      <TableRow key={m.id} className="cursor-pointer" onClick={() => { useAppStore.getState().setSelectedMemberId(m.id); useAppStore.getState().setView('member-profile'); }}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-[var(--feua-green)] text-white">{`${m.firstName?.[0] || ''}${m.lastName?.[0] || ''}`.toUpperCase()}</AvatarFallback></Avatar>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{m.firstName} {m.lastName}</p>
                              <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell font-mono text-xs">{m.matricule}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{m.institution || '-'}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{ACCESS_LABELS[m.accessLevel] || m.accessLevel}</Badge></TableCell>
                        <TableCell><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeSoft[m.status] || 'bg-gray-100 text-gray-700'}`}>{statusBadge[m.status]?.label || m.status}</span></TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { useAppStore.getState().setSelectedMemberId(m.id); useAppStore.getState().setView('member-profile'); }}><Eye className="mr-2 h-4 w-4" />Voir le profil</DropdownMenuItem>
                              {canAccess(member?.accessLevel || 'IGN', 'MASTER') && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => setUpdateDialog({ open: true, memberId: m.id, field: 'accessLevel', value: m.accessLevel })}><Shield className="mr-2 h-4 w-4" />Changer le rôle</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setUpdateDialog({ open: true, memberId: m.id, field: 'status', value: m.status })}><CheckCircle className="mr-2 h-4 w-4" />Changer le statut</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setUpdateDialog({ open: true, memberId: m.id, field: 'status', value: 'ARCHIVED' }); }}><Archive className="mr-2 h-4 w-4" />Archiver</DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">{total} membre(s) — Page {page}</p>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" disabled={page * 10 >= total} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Update dialog */}
      <Dialog open={updateDialog.open} onOpenChange={(o) => setUpdateDialog({ ...updateDialog, open: o })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{updateDialog.field === 'accessLevel' ? 'Changer le niveau d\'accès' : 'Changer le statut'}</DialogTitle>
          </DialogHeader>
          <Select value={updateDialog.value} onValueChange={(v) => setUpdateDialog({ ...updateDialog, value: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {updateDialog.field === 'accessLevel'
                ? Object.entries(ACCESS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)
                : [
                    { value: 'ACTIVE', label: 'Actif' },
                    { value: 'PENDING_VALIDATION', label: 'En attente' },
                    { value: 'ARCHIVED', label: 'Archivé' },
                  ].map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)
              }
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialog({ ...updateDialog, open: false })}>Annuler</Button>
            <Button className="bg-[var(--feua-green)] hover:bg-[var(--feua-green)]/90 text-white" onClick={handleUpdate}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
