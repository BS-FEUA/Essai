"use client";

import React from "react";
import {
  X,
  Printer,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { Communique } from "@/types";
import { ROLE_INFOS } from "@/lib/data";
import { formatDate } from "@/lib/utils";

interface CommuniqueModalProps {
  communique: Communique | null;
  onClose: () => void;
}

export const CommuniqueModal: React.FC<CommuniqueModalProps> = ({
  communique,
  onClose,
}) => {
  if (!communique) return null;

  const roleInfo = ROLE_INFOS[communique.authorRole];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-feua text-amber-300 font-bold flex items-center justify-center text-sm">BS</div>
            <div>
              <span className="text-xs font-bold text-feua tracking-wider uppercase block">Fédération des Étudiants (FEUA)</span>
              <span className="text-[11px] text-slate-500 font-semibold">Bureau Syndical du Campus de Lokossa</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
              title="Imprimer ce communiqué"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Référence Officielle</span>
            <span className="text-sm font-mono font-extrabold text-slate-900">{communique.referenceNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
              {communique.category}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(communique.date)}
            </span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug tracking-tight">{communique.title}</h1>

        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
          {communique.content}
        </div>

        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-feua flex items-center justify-center font-bold text-xs border border-emerald-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{communique.authorName}</p>
              <p className="text-[11px] text-slate-500">{roleInfo?.fullName || "Bureau Syndical BS-Lokossa"}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="bg-feua hover:bg-feua-dark text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
          >
            Fermer l&apos;affichage
          </button>
        </div>
      </div>
    </div>
  );
};