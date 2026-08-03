"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute -left-32 top-0 -z-10 h-96 w-96 rounded-full bg-emerald-300/30 blur-3xl" />
      <div className="absolute -right-32 bottom-0 -z-10 h-96 w-96 rounded-full bg-sky-300/35 blur-3xl" />
      <section className="glass w-full max-w-md rounded-3xl p-6 sm:p-8">
        <Link href="/" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-feua">
          <ArrowLeft className="h-4 w-4" /> Retour au portail
        </Link>
        <div className="mb-7 flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-feua to-emerald-600 text-white shadow-lg shadow-emerald-600/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-feua"><Sparkles className="h-3.5 w-3.5" /> BS-Lokossa</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{subtitle}</p>
          </div>
        </div>
        {children}
      </section>
    </main>
  );
}
