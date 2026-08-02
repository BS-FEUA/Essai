"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Search,
  PlusCircle,
  Filter,
  User,
  GraduationCap,
  Building2,
  Sparkles,
  ArrowUpRight,
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

  // Modal orinline editing state for admin mode
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
    const matchesCat =
      selectedCategory === "Tous" || claim.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "Tous" || claim.status === selectedStatus;
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
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-feua-dark text-white p-6 rounded-2xl shadow-sm border border-emerald-800/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-300" />
            <h2 className="text-xl font-bold tracking-tight">
              Portail des Revendications & Doléances Étudiantes
            </h2>
          </div>
          <p className="text-xs text-slate-300">
            Un problème de notes, d&apos;équipements de laboratoire ou de logement ? Soumettez votre dossier directement au Bureau Syndical.
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

      {/* Filter and Search Bar */}
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
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Statut:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none font-medium"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
            Catégories:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-feua text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-4">
        {filteredClaims.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center ring-1 ring-slate-200 space-y-2">
            <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">
              Aucune revendication ne correspond aux critères sélectionnés.
            </p>
            <button
              onClick={onOpenNewClaim}
              className="text-xs font-bold text-feua hover:underline"
            >
              + Soumettre la première revendication
            </button>
          </div>
        ) : (
          filteredClaims.map((claim) => (
            <div
              key={claim.id}
              className="bg-white rounded-2xl p-5 ring-1 ring-slate-200/90 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${getUrgencyBadge(
                      claim.urgency
                    )}`}
                  >
                    Urgence: {claim.urgency}
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                      claim.status
                    )}`}
                  >
                    {claim.status}
                  </span>

                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    {claim.category}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  Dossier #{claim.id} • Mis à jour {formatDate(claim.updatedAt)}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {claim.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {claim.description}
                </p>
              </div>

              {/* Student Metadata */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1 font-semibold text-slate-700">
                  <User className="w-3.5 h-3.5 text-feua" />
                  <span>{claim.studentName}</span>
                  <span className="text-slate-400 font-mono font-normal">
                    ({claim.studentId})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  <span>{claim.filiere}</span>
                </div>
              </div>

              {/* Official Admin / Bureau Response if present */}
              {claim.adminResponse && (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 space-y-1 mt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-feua">
                    <MessageSquare className="w-3.5 h-3.5 text-feua" />
                    <span>
                      Réponse du Bureau Syndical
                      {claim.assignedRole &&
                        ` (${ROLE_INFOS[claim.assignedRole]?.title})`}
                      :
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {claim.adminResponse}
                  </p>
                </div>
              )}

              {/* Executive Mode Actions */}
              {isAdminMode && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleOpenEdit(claim)}
                    className="bg-slate-900 hover:bg-slate-800 text-amber-300 font-semibold text-xs px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5"
                  >
                    <span>Mettre à jour ce dossier (Bureau)</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Admin Edit Claim Modal */}
      {editingClaim && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Traiter le dossier #{editingClaim.id} - BS-Lokossa
            </h3>
            <p className="text-xs text-slate-500">
              Sujet: &quot;{editingClaim.title}&quot; par {editingClaim.studentName}
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nouveau Statut du dossier:
                </label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value as ClaimStatus)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none"
                >
                  {statuses.filter((s) => s !== "Tous").map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Responsable syndical assigné:
                </label>
                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value as UserRole)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none"
                >
                  {Object.entries(ROLE_INFOS).map(([code, info]) => (
                    <option key={code} value={code}>
                      {info.title} - {info.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Réponse officielle / Compte-rendu de démarche:
                </label>
                <textarea
                  rows={4}
                  value={responseInput}
                  onChange={(e) => setResponseInput(e.target.value)}
                  placeholder="Expliquez la démarche entreprise auprès de la direction..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingClaim(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-feua text-white hover:bg-feua-dark"
              >
                Enregistrer la mise à jour
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
