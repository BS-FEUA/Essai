"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, FileText, LogIn, ShieldCheck, Users, Wallet } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { LiquidLogo } from "@/components/effects/LiquidLogo";

const capabilities = [
  { icon: Users, title: "Espace membre", text: "Adhésion, profil et suivi des demandes." },
  { icon: FileText, title: "Documents", text: "Archives, dépôts sécurisés et téléchargements." },
  { icon: Wallet, title: "Transparence", text: "Caisses, bilans et opérations contrôlées." },
  { icon: ShieldCheck, title: "Administration", text: "Gestion des membres, publications, commandes et audit." },
];

export function HomeLanding() {
  const { member } = useAppStore();

  return (
    <main className="relative isolate min-h-screen overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-40 top-24 -z-10 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-96 w-96 rounded-full bg-amber-300/20 blur-3xl" />
      <header className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/15 bg-slate-950/65 px-4 py-3 text-white shadow-xl backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-3"><img src="/feua-logo-transparent.png" alt="Logo FEUA" className="h-11 w-11 rounded-xl bg-white object-contain p-0.5" /><div><p className="font-extrabold">BS-Lokossa</p><p className="text-xs text-emerald-200">FEUA · UNSTIM · INSTI & ENSET</p></div></div>
        <div className="flex items-center gap-2"><Link href="/landa" className="hidden rounded-xl px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 sm:block">Espace Landa</Link><Link href={member ? "/dashboard" : "/login"} className="rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-400">{member ? "Mon tableau de bord" : "Se connecter"}</Link></div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-200"><ShieldCheck className="h-4 w-4" /> Organe officiel de représentation étudiante</span>
          <div><h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-6xl">Bureau Sectoriel de Lokossa</h1><p className="mt-2 font-serif text-2xl font-bold italic text-amber-600 sm:text-3xl">Pas sans vous.</p><p className="mt-3 max-w-xl text-sm font-semibold leading-relaxed text-emerald-800 dark:text-emerald-200">Fédération des Étudiants de l’Université d’Abomey (UNSTIM)<br /><span className="font-medium">Représentation sectorielle des étudiants de l’INSTI et de l’ENSET à Lokossa</span></p></div>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">Une plateforme unique pour les membres, le Bureau et l’administration : informations officielles, demandes, documents, caisses, uniformes et suivi transparent des activités.</p>
          <div className="flex flex-wrap gap-3"><Link href={member ? "/dashboard" : "/register"} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-500">{member ? "Accéder à mes services" : "Créer mon compte"}<ArrowRight className="h-4 w-4" /></Link><Link href="/login" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-5 py-3 text-sm font-bold text-slate-800 backdrop-blur hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white"><LogIn className="h-4 w-4" /> Connexion</Link></div>
        </motion.div>
        <div className="relative grid gap-4 sm:grid-cols-2">
          <div className="col-span-2 hidden justify-center pb-2 lg:flex">
            <LiquidLogo className="w-24" />
          </div>
          {capabilities.map(({ icon: Icon, title, text }, index) => <motion.article key={title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="glass-surface rounded-3xl p-5"><Icon className="h-7 w-7 text-emerald-500" /><h2 className="mt-5 font-bold text-slate-900 dark:text-white">{title}</h2><p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{text}</p></motion.article>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl rounded-3xl border border-emerald-200/70 bg-emerald-50/70 p-6 dark:border-emerald-400/15 dark:bg-emerald-950/25 sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="font-bold text-emerald-950 dark:text-emerald-100">Un seul espace, des droits adaptés à chaque rôle.</p><p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">Les espaces Bureau et Administration sont accessibles après connexion, selon les permissions du compte.</p></div><Link href="/login" className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-emerald-800 hover:underline dark:text-emerald-200"><BookOpen className="h-4 w-4" /> Découvrir les services</Link></div></section>
    </main>
  );
}
