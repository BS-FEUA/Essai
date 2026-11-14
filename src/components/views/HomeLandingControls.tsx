"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function HomeSessionSync() {
  const checkSession = useAppStore((state) => state.checkSession);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  return null;
}

export function HomeHeaderAccountLink() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  return (
    <Link
      href={isAuthenticated ? "/dashboard" : "/login"}
      className="rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-400"
    >
      {isAuthenticated ? "Mon tableau de bord" : "Se connecter"}
    </Link>
  );
}

export function HomePrimaryAccountLinks() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href={isAuthenticated ? "/dashboard" : "/register"}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-500"
      >
        {isAuthenticated ? "Accéder à mes services" : "Créer mon compte"}
        <ArrowRight className="h-4 w-4" />
      </Link>
      <Link
        href="/login"
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-5 py-3 text-sm font-bold text-slate-800 backdrop-blur hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white"
      >
        <LogIn className="h-4 w-4" /> Connexion
      </Link>
    </div>
  );
}
