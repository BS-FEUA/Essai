"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  PlusCircle,
  User,
  X,
} from "lucide-react";
import { Claim, ClaimStatus, UserRole } from "@/types";
import { ROLE_INFOS } from "@/lib/data";
import { formatDate } from "@/lib/utils";

interface RevendicationsSectionProps {
  claims: Claim[];
  isAdminMode: boolean;
  onOpenNewClaim: () => void;
  onUpdateClaimStatus: (
    claimId: string,
    newStatus: ClaimStatus,
    adminResponse?: string,
    assignedRole?: UserRole
  ) => void;
}

export const RevendicationsSection: React.FC<RevendicationsSectionProps> = ({
  claims,
  isAdminMode,
  onOpenNewClaim,
  onUpdateClaimStatus,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [selectedStatus, setSelectedStatus] = useState<string>("Tous");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);
  const [statusInput, setStatusInput] = useState<ClaimStatus>("En cours d'étude");
  const [responseInput, setResponseInput] = useState<string>("");
  const [roleInput, setRoleInput] = useState<UserRole>("mix");

  const categories = [
    "Tous",
    "Examens & Notes",
    "Salles & Matériel",
    "Restauration & Logement",
    "Transport",
    "Autre",
  ];

  const statuses = [
    "Tous",
    "Soumis",
    "En cours d'étude",
    "Négociation Direction",
    "Résolu",
    "Rejeté",
  ];

  const filteredClaims = claims.filter((claim) => {
    const matchesCat = selectedCategory === "Tous" || claim.category === selectedCategory;
    const matchesStatus = selectedStatus === "Tous" || claim.status === selectedStatus;
    const matchesQuery =
      searchQuery.trim() === "" ||
      claim.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.filiere.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesStatus && matchesQuery;
  });

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "Critique":
        return "bg-rose-100 text-rose-800 border-rose-300 font-bold";
      case "Haute":
        return "bg-amber-100 text-amber-800 border-amber-300 font-bold";
      case "Moyenne":
        return "bg-blue-100 text-blue-800 border-blue-300 font-medium";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300 font-medium";
    }
  };

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case "Résolu":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
      case "Négociation Direction":
        return "bg-amber-100 text-amber-800 border-amber-300 font-bold";
      case "En cours d'étude":
        return "bg-blue-100 text-blue-800 border-blue-300 font-medium";
      case "Rejeté":
        return "bg-rose-100 text-rose-800 border-rose-300 font-medium";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300 font-medium";
    }
  };

  const handleOpenEdit = (claim: Claim) => {
    setEditingClaim(claim);
    setStatusInput(claim.status);
    setResponseInput(claim.adminResponse || "");
    setRoleInput(claim.assignedRole || "mix");
  };

  const handleSaveEdit = () => {
    if (!editingClaim) return;
    onUpdateClaimStatus(
      editingClaim.id,
      statusInput,
      responseInput.trim() !== "" ? responseInput : undefined,
      roleInput
    );
    setEditingClaim(null);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-feua-dark text-white p-6 rounded-2xl shadow-sm border border-emerald-800/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-300" />
            <h2 className="text-xl font-bold tracking-tight">Portail des Revendications & Doléances Étudiantes</h2>
          </div>
          <p className="text-xs text-slate-300">
            Un problème de notes, d&apos;équipements de laboratoire ou de logement ? Soumettez votre dossier directement au Bureau Sectoriel.
          </p>
        </div>

        <button
          onClick={onOpenNewClaim}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-sm self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-slate-900" />
          <span>Créer un nouveau dossier</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl ring-1 ring-slate-200/90 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par sujet, nom ou matricule étudiant..."
              className="w-full text-xs text-slate-800 pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-feua/30"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Statut:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none font-medium"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pt-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Catégories:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat ? "bg-feua text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredClaims.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 ring-1 ring-slate-200 space-y-2 text-center">
            <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Aucune revendication ne correspond aux critères sélectionnés.</p>
            <button
              onClick={onOpenNewClaim}
              className="text-xs font-bold text-feua hover:underline"
            >
              + Soumettre la première revendication
            </button>
          </div>
        ) : (
          filteredClaims.map((claim) => (
            <div key={claim.id} className="bg-white rounded-2xl p-5 ring-1 ring-slate-200/90 shadow-sm hover:shadow-md transition space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${getUrgencyBadge(claim.urgency)}`}>
                    Urgence: {claim.urgency}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(claim.status)}`}>
                    {claim.status}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">{claim.category}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Dossier #{claim.id} • Mis à jour {formatDate(claim.updatedAt)}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base leading-snug">{claim.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {claim.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Filière: {claim.filiere}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  <span>{claim.studentName}</span>
                </div>
              </div>

              {claim.adminResponse && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-slate-700">
                  <div className="font-semibold text-slate-900 mb-1">Réponse du Bureau</div>
                  <p>{claim.adminResponse}</p>
                </div>
              )}

              {isAdminMode && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={() => handleOpenEdit(claim)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-feua text-white text-xs font-semibold px-4 py-2 hover:bg-feua-dark transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mettre à jour</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {editingClaim && (
        <div className="bg-slate-950/90 fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-bold text-slate-900">Modifier le statut du dossier {editingClaim.id}</div>
              <button
                onClick={() => setEditingClaim(null)}
                className="text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-2 text-xs text-slate-600">
                Statut
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value as ClaimStatus)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                >
                  {statuses.filter((st) => st !== "Tous").map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-xs text-slate-600">
                Rôle assigné
                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                >
                  {Object.entries(ROLE_INFOS).map(([code, info]) => (
                    <option key={code} value={code}>{info.title}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Réponse administrative</label>
              <textarea
                value={responseInput}
                onChange={(e) => setResponseInput(e.target.value)}
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <button
                onClick={() => setEditingClaim(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                className="rounded-xl bg-feua px-4 py-2 text-xs font-bold text-white hover:bg-feua-dark"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
