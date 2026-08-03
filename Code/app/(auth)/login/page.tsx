"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { DEMO_ACCOUNTS, signInDemo } from "@/lib/demo-auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const configured = isSupabaseConfigured();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) {
      const result = signInDemo(email, password);
      if ("error" in result) return setError(result.error ?? "Connexion démo impossible.");
      router.replace("/");
      return;
    }
    setLoading(true); setError("");
    const { error: signInError } = await createClient().auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) return setError(signInError.message);
    router.replace("/"); router.refresh();
  }

  return <AuthShell title="Connexion" subtitle="Accédez à votre espace membre et aux outils du bureau.">
    <form onSubmit={submit} className="space-y-4">
      {!configured && <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900"><p className="mb-2 font-bold">Mode démo actif</p>{DEMO_ACCOUNTS.map((account) => <button type="button" key={account.email} onClick={() => { setEmail(account.email); setPassword(account.password); }} className="mb-1 block text-left font-semibold text-feua hover:underline">{account.name} ({account.role}) : {account.email}</button>)}<p className="mt-1 text-sky-700">Cliquez sur un compte pour remplir le formulaire.</p></div>}
      <label className="block text-sm font-semibold text-slate-700">E-mail<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-3 outline-none transition focus:border-feua focus:ring-4 focus:ring-emerald-100" /></label>
      <label className="block text-sm font-semibold text-slate-700">Mot de passe<input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-3 outline-none transition focus:border-feua focus:ring-4 focus:ring-emerald-100" /></label>
      <div className="text-right"><Link className="text-sm font-semibold text-feua hover:underline" href="/forgot-password">Mot de passe oublié ?</Link></div>
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</p>}
      <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-feua px-4 py-3 font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-feua-dark disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} Se connecter</button>
    </form>
    <p className="mt-6 text-center text-sm text-slate-600">Pas encore de compte ? <Link href="/register" className="font-bold text-feua hover:underline">Créer un compte</Link></p>
  </AuthShell>;
}
