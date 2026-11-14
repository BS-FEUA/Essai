'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ACCESS_LABELS } from '@/lib/store';
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from 'lucide-react';

type VerifiedMember = {
  matricule: string;
  firstName: string;
  lastName: string;
  accessLevel: string;
  institution: string | null;
  filiere: string | null;
  niveau: string | null;
};

export function BadgeVerificationView({ token }: { token: string }) {
  const [member, setMember] = useState<VerifiedMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/badges/verify/${encodeURIComponent(token)}`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Badge invalide');
        return response.json();
      })
      .then((data) => { if (active && data.valid) setMember(data.member); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
      <Card className="w-full max-w-lg overflow-hidden shadow-xl">
        <CardHeader className="items-center bg-gradient-to-r from-[var(--feua-green)] to-emerald-700 py-8 text-center text-white">
          <img src="/feua-logo-transparent.png" alt="FEUA" className="mb-3 h-16 w-16 rounded-full bg-white p-2 object-contain" />
          <CardTitle className="flex items-center gap-2 text-xl"><ShieldCheck className="h-5 w-5" />Vérification du badge FEUA</CardTitle>
          <CardDescription className="text-white/75">Bureau Syndical de Lokossa</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Vérification en cours…</div>
          ) : member ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-200">
                <CheckCircle2 className="h-6 w-6 shrink-0" />
                <div><p className="font-bold">Badge valide</p><p className="text-sm">Ce badge est actif et autorisé par le Bureau.</p></div>
              </div>
              <div className="space-y-3 rounded-xl border p-4">
                <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Nom du membre</p><p className="text-lg font-bold">{member.firstName} {member.lastName}</p></div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Matricule</p><p className="font-semibold">{member.matricule}</p></div>
                  <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Fonction</p><Badge>{ACCESS_LABELS[member.accessLevel] || member.accessLevel}</Badge></div>
                </div>
                {member.institution && <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Institution</p><p className="text-sm">{member.institution}</p></div>}
                {(member.filiere || member.niveau) && <p className="text-sm text-muted-foreground">{[member.filiere, member.niveau].filter(Boolean).join(' · ')}</p>}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-700 dark:text-red-200">
              <XCircle className="h-6 w-6 shrink-0" />
              <div><p className="font-bold">Badge invalide ou révoqué</p><p className="text-sm">{error ? 'Aucun badge actif ne correspond à ce code.' : 'Les informations du badge sont indisponibles.'}</p></div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
