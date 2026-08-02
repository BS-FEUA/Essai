"use client";

import React, { useState } from "react";
import {
  CreditCard,
  PieChart as PieIcon,
  CheckCircle2,
  Receipt,
  Search,
  PlusCircle,
  Printer,
} from "lucide-react";
import { CotisationRecord, FinancialSummary } from "@/types";
import { formatFCFA, formatDate } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface CotisationsSectionProps {
  cotisations: CotisationRecord[];
  summary: FinancialSummary;
  isAdminMode: boolean;
  onOpenNewCotisation: () => void;
}

export const CotisationsSection: React.FC<CotisationsSectionProps> = ({
  cotisations,
  summary,
  isAdminMode,
  onOpenNewCotisation,
}) => {
  const [searchMatricule, setSearchMatricule] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<CotisationRecord | null>(
    null
  );

  const filteredCotisations = cotisations.filter(
    (c) =>
      searchMatricule.trim() === "" ||
      c.matricule.toLowerCase().includes(searchMatricule.toLowerCase()) ||
      c.studentName.toLowerCase().includes(searchMatricule.toLowerCase())
  );

  const COLORS = ["#0B5D3B", "#D97706", "#2563EB", "#9333EA"];

  return (
    <section className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white p-6 rounded-2xl shadow-sm border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-300" />
              <h2 className="text-xl font-bold tracking-tight">
                Gestion des Cotisations & Transparence Financière
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              La cotisation statutaire (500 FCFA/an) garantit l&apos;autonomie du bureau syndical et finance l&apos;assistance sociale, l&apos;impression des supports et l&apos;action syndicale.
            </p>
          </div>

          {isAdminMode && (
            <button
              onClick={onOpenNewCotisation}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm self-start md:self-auto"
            >
              <PlusCircle className="w-4 h-4 text-slate-900" />
              <span>Enregistrer un reçu de cotisation</span>
            </button>
          )}
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl ring-1 ring-slate-200/90 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Encaissé
          </div>
          <div className="text-2xl font-black text-feua">
            {formatFCFA(summary.totalCollected)}
          </div>
          <div className="text-[11px] text-slate-400">
            Provient de {summary.contributorCount} cotisants
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl ring-1 ring-slate-200/90 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Dépenses Engagées
          </div>
          <div className="text-2xl font-black text-amber-600">
            {formatFCFA(summary.totalSpent)}
          </div>
          <div className="text-[11px] text-slate-400">
            Social, Impression, AG
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl ring-1 ring-slate-200/90 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Solde en Caisse
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {formatFCFA(summary.balance)}
          </div>
          <div className="text-[11px] text-slate-400">
            Certifié par le Trésorier Général
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl ring-1 ring-slate-200/90 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Montant Statutaire
          </div>
          <div className="text-2xl font-black text-slate-900">500 FCFA</div>
          <div className="text-[11px] text-slate-400">Par étudiant / an</div>
        </div>
      </div>

      {/* Expense Breakdown Visual Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl ring-1 ring-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-feua" />
              Répartition des Dépenses Syndicales
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
              Transparence
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.expensesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="amount"
                  nameKey="category"
                >
                  {summary.expensesByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: unknown) => [
                    formatFCFA(Number(val) || 0),
                    "Montant",
                  ]}
                />
                <Legend
                  formatter={(value: string) => (
                    <span className="text-xs text-slate-700 font-medium">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Search for Student Receipt */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl ring-1 ring-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-600" />
              Vérifier un Reçu de Cotisation
            </h3>
            <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-medium border border-amber-200">
              Anti-Fraude
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchMatricule}
              onChange={(e) => setSearchMatricule(e.target.value)}
              placeholder="Entrez votre nom ou matricule (ex: 2024-LOK-0492)..."
              className="w-full text-xs text-slate-800 pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-feua/30"
            />
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {filteredCotisations.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">
                Aucun paiement enregistré pour cette recherche.
              </p>
            ) : (
              filteredCotisations.map((cot) => (
                <div
                  key={cot.id}
                  onClick={() => setSelectedReceipt(cot)}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 transition cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-slate-900">
                      {cot.studentName} ({cot.matricule})
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {cot.filiere} • {cot.niveau}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-extrabold text-xs text-feua block">
                      {formatFCFA(cot.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {cot.receiptNumber}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Official Receipt Preview Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            {/* Stamp header */}
            <div className="text-center border-b border-slate-200 pb-3 space-y-1">
              <div className="inline-block bg-feua text-amber-300 font-black text-xs px-2.5 py-0.5 rounded uppercase tracking-widest">
                FEUA - BS-LOKOSSA
              </div>
              <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">
                Reçu Officiel de Cotisation
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                N° {selectedReceipt.receiptNumber}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Étudiant:</span>
                <span className="font-bold text-slate-900">
                  {selectedReceipt.studentName}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Matricule:</span>
                <span className="font-mono text-slate-900">
                  {selectedReceipt.matricule}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Filière / Niveau:</span>
                <span className="text-slate-800">
                  {selectedReceipt.filiere} ({selectedReceipt.niveau})
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Date d&apos;encaissement:</span>
                <span className="text-slate-800">
                  {formatDate(selectedReceipt.datePaid)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Délivré par:</span>
                <span className="text-slate-800">{selectedReceipt.receivedBy}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-700">Montant versé:</span>
                <span className="text-lg font-black text-feua">
                  {formatFCFA(selectedReceipt.amount)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Paiement valide et authentifié au registre</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer Reçu</span>
              </button>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="bg-feua hover:bg-feua-dark text-white font-semibold text-xs px-4 py-2 rounded-xl transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
