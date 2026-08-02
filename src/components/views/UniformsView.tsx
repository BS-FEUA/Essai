'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, canAccess, apiFetch } from '@/lib/store';
import { orderBadge } from './view-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Shirt, Plus, ChevronLeft, ChevronRight, CheckCircle,
} from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export function UniformsView() {
  const { member } = useAppStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({ taille: 'M', quantity: '1', notes: '', paymentMethod: 'ESPECES' });

  const userLevel = member?.accessLevel || 'IGN';
  const isAdmin = canAccess(userLevel, 'MASTER');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ orders: any[]; total: number }>(`/api/uniforms?page=${page}&limit=20`);
      setOrders(data.orders);
      setTotal(data.total);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [page]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOrders();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadOrders]);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/uniforms', {
        method: 'POST',
        body: JSON.stringify({ ...orderForm, quantity: Number(orderForm.quantity) }),
      });
      setOrderOpen(false);
      setOrderForm({ taille: 'M', quantity: '1', notes: '', paymentMethod: 'ESPECES' });
      loadOrders();
    } catch { /* ignore */ }
  };

  const handleValidate = async (orderId: string, newStatus: string) => {
    try {
      await apiFetch('/api/uniforms', {
        method: 'PUT',
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      loadOrders();
    } catch { /* ignore */ }
  };

  const tailles = ['S', 'M', 'L', 'XL', 'XXL'];

  const validationLabel: Record<string, { label: string; next: string }> = {
    EN_ATTENTE: { label: '✓ Valider (étape 1)', next: 'VAL1' },
    VAL1: { label: '✓ Valider (étape 2)', next: 'VAL2' },
    VAL2: { label: '✓ Marquer livré', next: 'LIVRE' },
  };

  return (
    <motion.div {...pageVariants} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shirt className="h-6 w-6 text-[var(--feua-green)]" />Uniformes</h1>
        <Button className="bg-[var(--feua-green)] hover:bg-[var(--feua-green)]/90 text-white" onClick={() => setOrderOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />Nouvelle commande
        </Button>
      </div>

      {/* Order form dialog */}
      <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Commander un uniforme</DialogTitle><DialogDescription>Prix unitaire : 15 000 FCFA</DialogDescription></DialogHeader>
          <form onSubmit={handleOrder}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Taille</Label>
                <Select value={orderForm.taille} onValueChange={(v) => setOrderForm({ ...orderForm, taille: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{tailles.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Quantité</Label><Input type="number" min="1" max="10" value={orderForm.quantity} onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Mode de paiement</Label>
                <Select value={orderForm.paymentMethod} onValueChange={(v) => setOrderForm({ ...orderForm, paymentMethod: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="ESPECES">Espèces</SelectItem><SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem><SelectItem value="VIREMENT">Virement</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={orderForm.notes} onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })} rows={2} /></div>
              <p className="text-sm font-medium text-[var(--feua-gold)]">Total : {(Number(orderForm.quantity) * 15000).toLocaleString()} FCFA</p>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" type="button" onClick={() => setOrderOpen(false)}>Annuler</Button>
              <Button type="submit" className="bg-[var(--feua-green)] hover:bg-[var(--feua-green)]/90 text-white">Commander</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Orders table */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
      ) : orders.length === 0 ? (
        <Card className="text-center py-12"><CardContent><Shirt className="h-12 w-12 mx-auto text-[var(--feua-gold)]/30 mb-3" /><p className="text-muted-foreground">Aucune commande pour le moment.</p></CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="tbody-row-hover">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Membre</TableHead>
                    <TableHead>Taille</TableHead>
                    <TableHead className="hidden sm:table-cell">Qté</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    {isAdmin && <TableHead className="text-right">Validation</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id} className="hover:bg-[var(--feua-green-light)]/30 dark:hover:bg-emerald-900/20">
                      <TableCell className="text-sm">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell className="text-sm font-medium">{isAdmin && o.member ? `${o.member.firstName} ${o.member.lastName}` : 'Vous'}</TableCell>
                      <TableCell className="text-sm">{o.taille}</TableCell>
                      <TableCell className="text-sm hidden sm:table-cell">{o.quantity}</TableCell>
                      <TableCell className="text-sm font-mono">{(o.totalAmount || 0).toLocaleString()} FCFA</TableCell>
                      <TableCell><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${orderBadge[o.status]?.color || 'bg-gray-100'}`}>{orderBadge[o.status]?.label || o.status}</span></TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          {validationLabel[o.status] && (
                            <Button size="sm" className="bg-[var(--feua-green)] hover:bg-[var(--feua-green)]/90 text-white text-xs h-7" onClick={() => handleValidate(o.id, validationLabel[o.status].next)}>
                              <CheckCircle className="mr-1 h-3 w-3" />{validationLabel[o.status].label}
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {total > 20 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{total} commande(s)</p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
