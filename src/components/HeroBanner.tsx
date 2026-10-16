"use client";

import React from "react";
import {
  ShieldCheck,
  Building2,
  FileCheck2,
  Users,
  Megaphone,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { CAMPUS_STATS } from "@/lib/data";

interface HeroBannerProps {
  onOpenNewClaim: () => void;
  onNavigate: (tab: string) => void;
  onOpenInscription?: () => void;
  claimCount: number;
  communiqueCount: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onOpenNewClaim,
  onNavigate,
  onOpenInscription,
  claimCount,
  communiqueCount,
}) => {
  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-feua-dark to-slate-900 text-white overflow-hidden border-b border-emerald-900/50 shadow-inner">
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Organe Officiel de Représentation Étudiante • FEUA - Lokossa</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Bureau Sectoriel de Lokossa <br />
              <span className="text-amber-300 font-serif italic">Pas sans vous.</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
              Bienvenue sur la plateforme numérique officielle du BS-Lokossa.
              Consultez les communiqués du bureau, suivez l&apos;avancement de vos revendications académiques (IUT & ENSET), payez vos cotisations et participez aux assemblées générales.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  onNavigate("inscription");
                  if (onOpenInscription) onOpenInscription();
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2 border border-emerald-400/30"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Adhérer & Espace Membre</span>
              </button>

              <button
                onClick={onOpenNewClaim}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg hover:shadow-amber-400/20 transition flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-slate-900" />
                <span>Soumettre une revendication</span>
              </button>

              <button
                onClick={() => onNavigate("communiques")}
                className="bg-slate-800/90 hover:bg-slate-700 text-slate-100 font-medium text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition flex items-center gap-2"
              >
                <Megaphone className="w-4 h-4 text-emerald-400" />
                <span>Communiqués ({communiqueCount})</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 rounded-2xl p-4 space-y-1 hover:border-emerald-500/40 transition">
              <div className="flex items-center justify-between text-emerald-400">
                <Users className="w-5 h-5" />
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                  IUT & ENSET
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {CAMPUS_STATS.totalStudents.toLocaleString("fr-FR")}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Étudiants représentés à Lokossa
              </p>
            </div>

            <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 rounded-2xl p-4 space-y-1 hover:border-amber-500/40 transition">
              <div className="flex items-center justify-between text-amber-400">
                <FileCheck2 className="w-5 h-5" />
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                  2025-2026
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {CAMPUS_STATS.resolvedClaimsThisYear}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Revendications réglées avec succès
              </p>
            </div>

            <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 rounded-2xl p-4 space-y-1 hover:border-blue-500/40 transition">
              <div className="flex items-center justify-between text-blue-400">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full">
                  Suivi direct
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {claimCount}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Dossiers en cours de négociation
              </p>
            </div>

            <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 rounded-2xl p-4 space-y-1 hover:border-purple-500/40 transition">
              <div className="flex items-center justify-between text-purple-400">
                <TrendingUp className="w-5 h-5" />
                <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full">
                  Cotisation
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {CAMPUS_STATS.cotisationRate}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Taux d&apos;adhésion au syndicat
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
