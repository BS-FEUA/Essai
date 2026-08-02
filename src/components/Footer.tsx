"use client";

import React from "react";
import {
  ShieldCheck,
  Building,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-feua flex items-center justify-center font-black text-amber-300 text-base">
                BS
              </div>
              <span className="font-bold text-white text-base">BS-Lokossa</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Bureau Syndical de Lokossa (FEUA). Organe officiel de représentation et de défense des droits des étudiants de l'IUT et de l'ENSET Lokossa.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-amber-300">
              Campus & Localisation
            </h4>
            <p className="flex items-start gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Centre Universitaire de Lokossa, Bâtiment de la Garde Syndicale BS, Lokossa, Bénin</span>
            </p>
            <p className="flex items-center gap-2 text-slate-300 pt-1">
              <Building className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>IUT Lokossa & ENSET Lokossa</span>
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-amber-300">
              Urgences & Contacts
            </h4>
            <p className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Présidence BS: +229 97 42 18 90</span>
            </p>
            <p className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Secrétariat Général: +229 96 11 09 84</span>
            </p>
            <p className="flex items-center gap-2 text-slate-300">
              <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>contact.bslokossa@feua.bj</span>
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-amber-300">
              Affiliations
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Membre de la Fédération des Étudiants de l'Université d'Abomey-Calavi (FEUA).
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-mono text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Plateforme Officielle BS-Lokossa</span>
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-slate-500">
          <p>© 2026 BS-Lokossa (FEUA). Tous droits réservés.</p>
          <p className="flex items-center gap-1"><span>Fait pour les étudiants de Lokossa</span></p>
        </div>
      </div>
    </footer>
  );
};
