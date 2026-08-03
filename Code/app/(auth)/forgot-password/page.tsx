"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState(""); const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!isSupabaseConfigured()) return setMessage("En mode démo, utilisez les identifiants affichés sur la page de connexion ou créez un nouveau compte de test."); setLoading(true); setError(""); const { error: resetError } = await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` }); setLoading(false); if (resetError) return setError(resetError.message); setMessage("Si ce compte existe, un e-mail de réinitialisation vient d'être envoyé."); }
  return <AuthShell title="Mot de passe oublié" subtitle="Nous vous enverrons un lien sécurisé pour retrouver votre accès.">
    <form onSubmit={submit} className="space-y-4"><label className="block text-sm font-semibold text-slate-700">E-mail<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-3 outline-none focus:border-feua focus:ring-4 focus:ring-emerald-100" /></label>{error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</p>}{message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">{message}</p>}<button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-feua px-4 py-3 font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-feua-dark disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} Envoyer le lien</button></form><p className="mt-6 text-center text-sm text-slate-600"><Link href="/login" className="font-bold text-feua hover:underline">Retour à la connexion</Link></p>
  </AuthShell>;
}
