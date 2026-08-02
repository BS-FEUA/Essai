'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppStore, ACCESS_LABELS, apiFetch } from '@/lib/store';
import { roleBadgeColor, statusBadge, orderBadge } from './view-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft, Building, BookOpen, User, FileText, Wallet, Shirt, Mail, Phone, Calendar, Clock, Globe,
} from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export function MemberProfileView() {
  const { member, selectedMemberId } = useAppStore();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedMemberId) return;
    let cancelled = false;
    (async () => {
      if (!cancelled) setLoading(true);
      try {
        const d = await apiFetch<{ member: any }>(`/api/members/${selectedMemberId}`);
        if (!cancelled) setProfileData(d.member);
      } catch { /* ignore */ }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [selectedMemberId]);

  if (loading) {
    return (
      <motion.div {...pageVariants} className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </motion.div>
    );
  }

  if (!profileData) {
    return (
      <motion.div {...pageVariants} className="text-center py-12">
        <p className="text-muted-foreground">Membre non trouvé</p>
        <Button variant="outline" onClick={() => router.push('/members')} className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" />Retour</Button>
      </motion.div>
    );
  }

  const initials = `${profileData.firstName?.[0] || ''}${profileData.lastName?.[0] || ''}`.toUpperCase();

  return (
    <motion.div {...pageVariants} className="space-y-6">
      <Button variant="ghost" onClick={() => router.push(member?.accessLevel === 'IGN' || member?.accessLevel === 'AMC' ? '/dashboard' : '/members')}><ArrowLeft className="mr-2 h-4 w-4" />Retour</Button>

      {/* Profile header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-20 w-20 border-2 border-[var(--feua-green)]">
              <AvatarFallback className="bg-[var(--feua-green)] text-white text-2xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold">{profileData.firstName} {profileData.lastName}</h1>
              <p className="text-muted-foreground flex flex-wrap items-center gap-2 justify-center sm:justify-start mt-1">
                <Badge className={roleBadgeColor[profileData.accessLevel] || ''}>{ACCESS_LABELS[profileData.accessLevel]}</Badge>
                <Badge variant={statusBadge[profileData.status]?.variant || 'outline'}>{statusBadge[profileData.status]?.label}</Badge>
                <span className="text-xs">{profileData.matricule}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {profileData.institution && <><Building className="inline h-3 w-3 mr-1" />{profileData.institution}</>}
                {profileData.filiere && <><span className="mx-1">•</span><BookOpen className="inline h-3 w-3 mr-1" />{profileData.filiere}</>}
                {profileData.niveau && <><span className="mx-1">•</span>{profileData.niveau}</>}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info"><User className="h-4 w-4 mr-1" />Informations</TabsTrigger>
          <TabsTrigger value="documents"><FileText className="h-4 w-4 mr-1" />Documents</TabsTrigger>
          <TabsTrigger value="transactions"><Wallet className="h-4 w-4 mr-1" />Transactions</TabsTrigger>
          <TabsTrigger value="orders"><Shirt className="h-4 w-4 mr-1" />Commandes</TabsTrigger>
        </TabsList>
        <TabsContent value="info" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Email', value: profileData.email, icon: <Mail className="h-4 w-4" /> },
                  { label: 'Téléphone', value: profileData.phone || '-', icon: <Phone className="h-4 w-4" /> },
                  { label: 'Inscrit le', value: profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString('fr-FR') : '-', icon: <Calendar className="h-4 w-4" /> },
                  { label: 'Dernière connexion', value: profileData.lastLoginAt ? new Date(profileData.lastLoginAt).toLocaleDateString('fr-FR') : '-', icon: <Clock className="h-4 w-4" /> },
                  { label: 'Date de naissance', value: profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString('fr-FR') : '-', icon: <Calendar className="h-4 w-4" /> },
                  { label: 'Pays', value: profileData.country || 'Bénin', icon: <Globe className="h-4 w-4" /> },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="text-muted-foreground">{item.icon}</div>
                    <div><p className="text-xs text-muted-foreground">{item.label}</p><p className="text-sm font-medium">{item.value}</p></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardContent className="p-4">
              {profileData.documents?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucun document</p>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/50"><TableRow><TableHead>Document</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {profileData.documents.map((d: any) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.title}</TableCell>
                        <TableCell><Badge variant="outline">{d.type}</Badge></TableCell>
                        <TableCell className="text-sm">{new Date(d.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardContent className="p-4">
              {profileData.cashTransactions?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune transaction</p>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/50"><TableRow><TableHead>Description</TableHead><TableHead>Montant</TableHead><TableHead>Statut</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {profileData.cashTransactions.map((tx: any) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium">{tx.description}</TableCell>
                        <TableCell>{tx.amount.toLocaleString()} FCFA</TableCell>
                        <TableCell><Badge variant={tx.status === 'COMPLETED' ? 'default' : 'secondary'}>{tx.status}</Badge></TableCell>
                        <TableCell className="text-sm">{new Date(tx.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardContent className="p-4">
              {profileData.uniformOrders?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune commande</p>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/50"><TableRow><TableHead>Taille</TableHead><TableHead>Qté</TableHead><TableHead>Total</TableHead><TableHead>Statut</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {profileData.uniformOrders.map((o: any) => (
                      <TableRow key={o.id}>
                        <TableCell>{o.taille}</TableCell>
                        <TableCell>{o.quantity}</TableCell>
                        <TableCell>{o.totalAmount.toLocaleString()} FCFA</TableCell>
                        <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${orderBadge[o.status]?.color || 'bg-gray-100'}`}>{orderBadge[o.status]?.label || o.status}</span></TableCell>
                        <TableCell className="text-sm">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
