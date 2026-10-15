'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, apiFetch } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Wallet, DollarSign, Plus, ChevronLeft, ChevronRight,
} from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export function CashView() {
  const [members, setMembers] = useState<any[]>([]);
  const [registers, setRegisters] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterRegister, setFilterRegister] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);
  const [txOpen, setTxOpen] = useState(false);
  const [txForm, setTxForm] = useState({ registerId: '', type: 'DEPOSIT', amount: '', description: '', paymentMethod: 'ESPECES', memberId: '' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [r, t, m] = await Promise.all([
          apiFetch<{ registers: any[] }>('/api/cash/registers'),
          apiFetch<{ transactions: any[]; total: number }>('/api/cash?page=1&limit=20'),
          apiFetch<{ members: any[] }>('/api/members?page=1&limit=999'),
        ]);
        setRegisters(r.registers);
        setTransactions(t.transactions);
        setTotal(t.total);
        setMembers(m.members);
        if (r.registers.length > 0) setTxForm((f) => ({ ...f, registerId: r.registers[0].id }));
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    load();
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', registerId: filterRegister, type: filterType });
      const data = await apiFetch<{ transactions: any[]; total: number }>(`/api/cash?${params}`);
      setTransactions(data.transactions);
      setTotal(data.total);
    } catch { /* ignore */ }
  }, [page, filterRegister, filterType]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTransactions();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadTransactions]);

  const handleAddTx = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/cash', {
        method: 'POST',
        body: JSON.stringify({ ...txForm, amount: Number(txForm.amount) }),
      });
      setTxOpen(false);
      setTxForm({ ...txForm, amount: '', description: '', memberId: '' });
      loadTransactions();
      const r = await apiFetch<{ registers: any[] }>('/api/cash/registers');
      setRegisters(r.registers);
    } catch { /* ignore */ }
  };

  const totalBalance = registers.reduce((sum, r) => sum + (r.balance || 0), 0);

  return (
    <motion.div {...pageVariants} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Wallet className="h-6 w-6 text-[var(--feua-gold)]" />Caisses</h1>
        <Button className="bg-[var(--feua-green)] hover:bg-[var(--feua-green)]/90 text-white" onClick={() => setTxOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />Transaction
        </Button>
      </div>

      {/* Total balance banner */}
      <Card className="bg-gradient-to-r from-[var(--feua-green)] to-emerald-700 text-white shadow-lg animate-glow-pulse">
        <CardContent className="p-6 sm:p-8 text-center">
          <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-60" />
          <p className="text-sm sm:text-base opacity-80">Solde total</p>
          <p className="text-3xl sm:text-4xl font-bold mt-1">{totalBalance.toLocaleString()} FCFA</p>
          <p className="text-xs opacity-60 mt-2">Solde toutes caisses confondues</p>
        </CardContent>
      </Card>

      {/* Sub-caisses grid */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Sous-caisses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {registers.map((reg) => (
            <Card key={reg.id} className="hover:shadow-md transition-shadow border-l-4 border-l-[var(--feua-green)]">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-muted-foreground">{reg.name || 'Caisse principale'}</p>
                <p className="text-xl font-bold text-[var(--feua-green)] mt-1">{(reg.balance || 0).toLocaleString()} FCFA</p>
                <p className="text-xs text-muted-foreground mt-1">{reg._count?.transactions || 0} transactions</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add transaction dialog */}
      <Dialog open={txOpen} onOpenChange={setTxOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvelle transaction</DialogTitle></DialogHeader>
          <form onSubmit={handleAddTx}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Caisse</Label>
                <Select value={txForm.registerId} onValueChange={(v) => setTxForm({ ...txForm, registerId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{registers.map((r) => <SelectItem key={r.id} value={r.id}>{r.name || 'Caisse'}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={txForm.type} onValueChange={(v) => setTxForm({ ...txForm, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="DEPOSIT">Dépôt</SelectItem><SelectItem value="WITHDRAWAL">Retrait</SelectItem><SelectItem value="PAYMENT">Paiement</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Membre (optionnel)</Label>
                <Select value={txForm.memberId} onValueChange={(v) => setTxForm({ ...txForm, memberId: v === '__none__' ? '' : v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un membre" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Aucun —</SelectItem>
                    {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Montant (FCFA)</Label><Input type="number" value={txForm.amount} onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Description</Label><Input value={txForm.description} onChange={(e) => setTxForm({ ...txForm, description: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Mode de paiement</Label>
                <Select value={txForm.paymentMethod} onValueChange={(v) => setTxForm({ ...txForm, paymentMethod: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="ESPECES">Espèces</SelectItem><SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem><SelectItem value="VIREMENT">Virement</SelectItem><SelectItem value="CARTE">Carte</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" type="button" onClick={() => setTxOpen(false)}>Annuler</Button>
              <Button type="submit" className="bg-[var(--feua-green)] hover:bg-[var(--feua-green)]/90 text-white">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={filterRegister || 'all'} onValueChange={(v) => setFilterRegister(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Caisse" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Toutes les caisses</SelectItem>{registers.map((r) => <SelectItem key={r.id} value={r.id}>{r.name || 'Caisse'}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filterType || 'all'} onValueChange={(v) => setFilterType(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Tous</SelectItem><SelectItem value="DEPOSIT">Dépôts</SelectItem><SelectItem value="WITHDRAWAL">Retraits</SelectItem></SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions table */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Transactions récentes</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="tbody-row-hover">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="hidden sm:table-cell">Mode</TableHead>
                    <TableHead className="hidden md:table-cell">Membre</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [1, 2, 3].map(i => <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell></TableRow>)
                  ) : transactions.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <DollarSign className="h-10 w-10 text-[var(--feua-gold)]/30" />
                        <p className="text-muted-foreground">Aucune transaction enregistrée</p>
                      </div>
                    </TableCell></TableRow>
                  ) : transactions.map((tx, idx) => (
                    <TableRow key={tx.id} className={idx % 2 === 0 ? 'bg-background dark:bg-transparent' : 'bg-muted/20 dark:bg-muted/10'}>
                      <TableCell className="font-medium text-sm">{tx.description}</TableCell>
                      <TableCell><Badge variant={tx.type === 'DEPOSIT' ? 'default' : 'destructive'}>{tx.type === 'DEPOSIT' ? 'Dépôt' : tx.type === 'WITHDRAWAL' ? 'Retrait' : 'Paiement'}</Badge></TableCell>
                      <TableCell className="font-mono text-right">{tx.amount.toLocaleString()} FCFA</TableCell>
                      <TableCell className="text-sm hidden sm:table-cell">{tx.paymentMethod}</TableCell>
                      <TableCell className="text-sm hidden md:table-cell">{tx.member?.firstName} {tx.member?.lastName}</TableCell>
                      <TableCell>{tx.status === 'PENDING' ? (<Badge className="bg-[var(--feua-gold)]/15 text-[var(--feua-gold)] border-[var(--feua-gold)]/30 hover:bg-[var(--feua-gold)]/25" variant="outline">En attente</Badge>) : (<Badge variant={tx.status === 'COMPLETED' ? 'default' : 'secondary'}>{tx.status}</Badge>)}</TableCell>
                      <TableCell className="text-sm">{new Date(tx.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">{total} transaction(s)</p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
