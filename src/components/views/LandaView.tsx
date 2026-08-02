'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  Heart, Star, Megaphone, AlertTriangle, Shirt, CheckCircle2, LogIn, Loader2,
} from 'lucide-react';

const pageVariants = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export function LandaView() {
  const { member, announcements } = useAppStore();
  const [form, setForm] = useState({ name: '', phone: '', email: '', taille: 'M', quantity: '1', institution: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
    <motion.div {...pageVariants} className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <img src="/feua-logo.png" alt="FEUA" className="h-20 w-20 mx-auto object-contain" />
        <h1 className="text-3xl font-bold text-[var(--feua-green)]">Espace Landa</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Bienvenue sur l&apos;espace public de la FEUA. Découvrez notre organisation et commandez vos uniformes même sans être membre.
        </p>
      </div>

      {/* About FEUA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-red-500" />À propos de FEUA</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>La <strong className="text-foreground">Fédération des Étudiants Universitaires Associés (FEUA)</strong> est une organisation étudiante basée à Lokossa, au Bénin.</p>
            <p>Notre mission est d&apos;unir les étudiants pour défendre leurs droits, favoriser la solidarité et créer un environnement propice à la réussite académique.</p>
            <p>Le <strong className="text-foreground">Bureau Syndical (BS) de Lokossa</strong> est l&apos;organe local de la FEUA, gérant les activités syndicales et communautaires dans la région.</p>
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-[var(--feua-gold)]" />Nos valeurs</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                { title: 'Solidarité', desc: 'Ensemble, nous sommes plus forts.' },
                { title: 'Excellence', desc: 'Visons le succès académique et professionnel.' },
                { title: 'Intégrité', desc: 'Agissons avec honnêteté et transparence.' },
                { title: 'Engagement', desc: 'Nous nous investissons pour notre communauté.' },
              ].map((v) => (
                <li key={v.title} className="flex gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--feua-green)] mt-2 flex-shrink-0 shadow-[0_0_6px_rgba(27,122,61,0.5)]" />
                  <div><p className="font-medium text-sm">{v.title}</p><p className="text-xs text-muted-foreground">{v.desc}</p></div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-[var(--feua-gold)]" />Annonces</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {announcements.slice(0, 3).map((a) => (
                <div key={a.id} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    {a.isUrgent && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    <span className="font-medium text-sm">{a.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{a.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
