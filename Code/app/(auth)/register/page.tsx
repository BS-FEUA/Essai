"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { registerDemo } from "@/lib/demo-auth";

export default function RegisterPage() {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [notice, setNotice] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) return setError("Choisissez un mot de passe d'au moins 8 caractères.");
    if (!isSupabaseConfigured()) {
      const result = registerDemo(name, email, password);
      if ("error" in result) return setError(result.error ?? "Création du compte démo impossible.");
      return setNotice("Compte démo créé et connecté. Vous pouvez revenir au portail pour le tester.");
    }
    setLoading(true); setError("");
    const { error: signUpError } = await createClient().auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/auth/callback` } });
    setLoading(false);
    if (signUpError) return setError(signUpError.message);
    setNotice("Compte créé. Vérifiez votre e-mail pour confirmer votre inscription avant de vous connecter.");
  }
  return <AuthShell title="Créer un compte" subtitle="Rejoignez la plateforme officielle du Bureau Syndical.">
    {!isSupabaseConfigured() && <p className="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm text-sky-900">Mode démo actif : votre compte de test est conservé dans ce navigateur.</p>}
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm font-semibold text-slate-700">Nom complet<input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-3 outline-none focus:border-feua focus:ring-4 focus:ring-emerald-100" /></label>
      <label className="block text-sm font-semibold text-slate-700">E-mail<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-3 outline-none focus:border-feua focus:ring-4 focus:ring-emerald-100" /></label>
      <label className="block text-sm font-semibold text-slate-700">Mot de passe<input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-3 outline-none focus:border-feua focus:ring-4 focus:ring-emerald-100" /></label>
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</p>}{notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">{notice}</p>}
      <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-feua px-4 py-3 font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-feua-dark disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Créer mon compte</button>
    </form><p className="mt-6 text-center text-sm text-slate-600">Déjà membre ? <Link href="/login" className="font-bold text-feua hover:underline">Se connecter</Link></p>
  </AuthShell>;
}
