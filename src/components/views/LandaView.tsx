'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Megaphone, AlertTriangle, Shirt, CheckCircle2, LogIn, Loader2, ArrowLeft,
  CalendarDays,
} from 'lucide-react';

const pageVariants = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export function LandaView() {
  const { member } = useAppStore();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', email: '', taille: 'M', quantity: '1', institution: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch('/api/announcements')
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load publications.');
        return response.json();
      })
      .then((data) => {
        if (active) setAnnouncements(data.announcements || []);
      })
      .catch(() => {
        // The public page remains useful even if publications are unavailable.
      })
      .finally(() => {
        if (active) setAnnouncementsLoading(false);
      });

    return () => { active = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/landa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email || undefined,
          size: form.taille,
          quantity: parseInt(form.quantity) || 1,
          institution: form.institution || undefined,
          notes: form.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur serveur');
      setSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l\'envoi de la commande');
    } finally { setLoading(false); }
  };

  return (
    <motion.div {...pageVariants} className="space-y-8 relative">
      <Button variant="ghost" className="absolute -top-4 -left-4 sm:top-0 sm:left-0 z-10" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>

      {/* Header */}
      <div className="text-center space-y-4 pt-10 sm:pt-0">
        <img src="/feua-logo.png" alt="FEUA" className="h-20 w-20 mx-auto object-contain" />
        <h1 className="text-3xl font-bold text-[var(--feua-green)]">Espace Landa</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Publications officielles du Bureau et demandes de commande d&apos;uniforme.
        </p>
      </div>

      <section aria-labelledby="publications-title">
        <Card className="border-[var(--feua-gold)]/35">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle id="publications-title" className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-[var(--feua-gold)]" />Publications du Bureau</CardTitle>
                <CardDescription className="mt-1">Communiqués et informations officielles destinés à la communauté universitaire.</CardDescription>
              </div>
              <CalendarDays className="h-5 w-5 shrink-0 text-[var(--feua-green)]" />
            </div>
          </CardHeader>
          <CardContent>
            {announcementsLoading ? (
              <p className="text-sm text-muted-foreground">Chargement des publications...</p>
            ) : announcements.length === 0 ? (
              <p className="rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">Aucune publication n&apos;est disponible pour le moment. Revenez prochainement pour les informations du bureau.</p>
            ) : (
              <div className="space-y-3">
                {announcements.slice(0, 6).map((announcement) => (
                  <article key={announcement.id} className={`rounded-xl border p-4 ${announcement.isUrgent ? 'border-red-300 bg-red-50/70' : 'border-emerald-900/10 bg-muted/40'}`}>
                    <div className="flex items-start gap-2">
                      {announcement.isUrgent ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" /> : <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--feua-green)]" />}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                          {announcement.isUrgent && <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Urgent</span>}
                        </div>
                        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{announcement.content}</p>
                        {announcement.createdAt && <p className="mt-3 text-[11px] font-medium text-muted-foreground">Publié le {new Date(announcement.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Order uniform for non-members */}
      <Card className="border-[var(--feua-green)]">
        <CardHeader>
          <CardTitle className="text-[var(--feua-green)] flex items-center gap-2"><Shirt className="h-5 w-5" />Commander un uniforme</CardTitle>
          <CardDescription>Pas besoin d&apos;être membre pour commander !</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle2 className="h-16 w-16 mx-auto text-[var(--feua-green)]" />
              <p className="font-medium">Votre demande a été envoyée !</p>
              <p className="text-sm text-muted-foreground">Nous vous contacterons pour confirmer votre commande.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nom complet *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Jean Dupont" /></div>
                <div className="space-y-2"><Label>Téléphone *</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="+229 90 00 00 00" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jean@exemple.com" /></div>
                <div className="space-y-2"><Label>Institution</Label><Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} placeholder="Université de Lokossa" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Taille *</Label>
                  <Select value={form.taille} onValueChange={(v) => setForm({ ...form, taille: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Quantité *</Label><Input type="number" min="1" max="10" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Informations complémentaires..." /></div>
              <p className="text-sm text-[var(--feua-gold)] font-medium">Prix : 15 000 FCFA par unité</p>
              <Button type="submit" className="w-full bg-[var(--feua-green)] hover:bg-[var(--feua-green)]/90 text-white" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Envoyer la demande
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Login prompt */}
      {!member && (
        <div className="text-center space-y-3">
          <Separator />
          <p className="text-sm text-muted-foreground">Déjà membre de la FEUA ?</p>
          <Link href="/login">
            <Button className="bg-[var(--feua-green)] hover:bg-[var(--feua-green)]/90 text-white">
              <LogIn className="mr-2 h-4 w-4" />Se connecter
            </Button>
          </Link>
        </div>
      )}
    </motion.div>
  );
}
