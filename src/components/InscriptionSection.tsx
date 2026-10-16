"use client";

import React, { useState } from "react";
import {
  UserPlus,
  ShieldCheck,
  GraduationCap,
  Users,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { RegistrationRecord, UserCategory, UserRole } from "@/types";
import { ROLE_INFOS } from "@/lib/data";

interface InscriptionSectionProps {
  registrations: RegistrationRecord[];
  isAdminMode: boolean;
  onAddRegistration: (record: Omit<RegistrationRecord, "id" | "dateRegistered" | "status">) => void;
  onUpdateRegistrationStatus?: (id: string, newStatus: "Validé" | "Rejeté") => void;
}

export const InscriptionSection: React.FC<InscriptionSectionProps> = ({
  registrations,
  isAdminMode,
  onAddRegistration,
  onUpdateRegistrationStatus,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"form" | "card" | "admin">("form");
  const [category, setCategory] = useState<UserCategory>("membre_feua");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [matricule, setMatricule] = useState("");
  const [entite, setEntite] = useState<"IUT Lokossa" | "ENSET Lokossa" | "InstI Lokossa" | "Autre">("IUT Lokossa");
  const [filiere, setFiliere] = useState("");
  const [niveau, setNiveau] = useState("Licence 1");
  const [invitationCode, setInvitationCode] = useState("");
  const [bureauRole, setBureauRole] = useState<UserRole>("amc");
  const [photoUrl, setPhotoUrl] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
  );
  const [cotisationPaid, setCotisationPaid] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<RegistrationRecord | null>(
    registrations.length > 0 ? registrations[0] : null
  );
  const [adminSearch, setAdminSearch] = useState("");
  const [adminCategoryFilter, setAdminCategoryFilter] = useState<string>("all");
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !matricule) return;

    onAddRegistration({
      category,
      fullName,
      email,
      phone: phone || "+229 90 00 00 00",
      matricule,
      entite,
      filiere: filiere || "Génie Electrique & Informatique",
      niveau,
      photoUrl,
      invitationCode: category === "membre_bureau" ? invitationCode : undefined,
      bureauRole: category === "membre_bureau" ? bureauRole : undefined,
      cotisationStatus: cotisationPaid ? "À jour (500 FCFA)" : "Non payé",
    });

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setActiveSubTab("card");
    }, 1500);
  };

  const filteredAdminRegistrations = registrations.filter((r) => {
    const matchesSearch =
      r.fullName.toLowerCase().includes(adminSearch.toLowerCase()) ||
      r.matricule.toLowerCase().includes(adminSearch.toLowerCase()) ||
      r.email.toLowerCase().includes(adminSearch.toLowerCase());
    const matchesCategory =
      adminCategoryFilter === "all" || r.category === adminCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-feua-dark to-slate-900 text-white p-6 rounded-2xl shadow-md border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Portail d&apos;Inscription & Espace Membre FEUA
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Portail officiel d&apos;adhésion au Bureau Sectoriel de Lokossa pour les étudiants IUT, ENSET & InstI.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setActiveSubTab("form")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSubTab === "form"
                  ? "bg-feua text-white shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Formulaire d&apos;Inscription
            </button>
            <button
              onClick={() => setActiveSubTab("card")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSubTab === "card"
                  ? "bg-feua text-white shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Espace Membre & Carte
            </button>
            {isAdminMode && (
              <button
                onClick={() => setActiveSubTab("admin")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeSubTab === "admin"
                    ? "bg-amber-400 text-slate-950 shadow"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Gestion Admin ({registrations.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {activeSubTab === "form" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl ring-1 ring-slate-200/90 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-feua" />
                Formulaire d&apos;Adhésion Multi-Profils
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Remplissez vos coordonnées exactes pour obtenir votre Carte d&apos;Adhérent FEUA Numérique.
              </p>
            </div>

            {submittedSuccess ? (
              <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-emerald-950">
                  Inscription soumise avec succès !
                </h4>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  Votre demande a été enregistrée au registre du BS-Lokossa. Redirection vers votre Espace Membre et Carte Virtuelle...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    1. Sélectionner votre statut sur le Campus :
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div
                      onClick={() => setCategory("membre_feua")}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                        category === "membre_feua"
                          ? "border-feua bg-emerald-50/60 ring-2 ring-feua/20"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <GraduationCap className="w-5 h-5 text-feua" />
                        {category === "membre_feua" && (
                          <CheckCircle2 className="w-4 h-4 text-feua fill-emerald-100" />
                        )}
                      </div>
                      <div className="font-bold text-xs text-slate-900">Membre Adhérent FEUA</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Étudiant régulier (IUT / ENSET) souhaitant adhérer au bureau sectoriel.
                      </div>
                    </div>

                    <div
                      onClick={() => setCategory("etudiant_landa")}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                        category === "etudiant_landa"
                          ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        {category === "etudiant_landa" && (
                          <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-100" />
                        )}
                      </div>
                      <div className="font-bold text-xs text-slate-900">Étudiant Landa</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Étudiant sous statut Landais souhaitant s&apos;informer sur nos services du Bureau sectoriel.
                      </div>
                    </div>

                    <div
                      onClick={() => setCategory("membre_bureau")}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                        category === "membre_bureau"
                          ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <ShieldCheck className="w-5 h-5 text-amber-500" />
                        {category === "membre_bureau" && (
                          <CheckCircle2 className="w-4 h-4 text-amber-500 fill-amber-100" />
                        )}
                      </div>
                      <div className="font-bold text-xs text-slate-900">Candidat au Bureau</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Candidat proposé pour représenter votre section au BS-Lokossa.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Nom complet *</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nom et prénoms"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-feua/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Email *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.bj"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-feua/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Matricule *</label>
                    <input
                      type="text"
                      value={matricule}
                      onChange={(e) => setMatricule(e.target.value)}
                      placeholder="Ex: 2024-LOK-0492"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-feua/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Téléphone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+229 90 00 00 00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-feua/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Université / Institut</label>
                    <select
                      value={entite}
                      onChange={(e) => setEntite(e.target.value as typeof entite)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-feua/30"
                    >
                      <option value="IUT Lokossa">IUT Lokossa</option>
                      <option value="ENSET Lokossa">ENSET Lokossa</option>
                      <option value="InstI Lokossa">InstI Lokossa</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Filière</label>
                    <input
                      type="text"
                      value={filiere}
                      onChange={(e) => setFiliere(e.target.value)}
                      placeholder="Ex: Génie Electrique"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-feua/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Niveau</label>
                    <select
                      value={niveau}
                      onChange={(e) => setNiveau(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-feua/30"
                    >
                      <option value="Licence 1">Licence 1</option>
                      <option value="Licence 2">Licence 2</option>
                      <option value="Licence 3">Licence 3</option>
                      <option value="Master 1">Master 1</option>
                      <option value="Master 2">Master 2</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Paiement de cotisation</label>
                    <select
                      value={cotisationPaid ? "paid" : "unpaid"}
                      onChange={(e) => setCotisationPaid(e.target.value === "paid")}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-feua/30"
                    >
                      <option value="paid">À jour (500 FCFA)</option>
                      <option value="unpaid">Non payé</option>
                    </select>
                  </div>
                </div>

                {category === "membre_bureau" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-700">Rôle proposé</label>
                      <select
                        value={bureauRole}
                        onChange={(e) => setBureauRole(e.target.value as UserRole)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-feua/30"
                      >
                        {Object.entries(ROLE_INFOS).map(([code, info]) => (
                          <option key={code} value={code}>
                            {info.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-700">Code d&apos;invitation</label>
                      <input
                        type="text"
                        value={invitationCode}
                        onChange={(e) => setInvitationCode(e.target.value)}
                        placeholder="FEUA-BS-2026-..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-feua/30"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-feua hover:bg-feua-dark text-white font-bold text-sm px-4 py-3 rounded-2xl transition"
                  >
                    Soumettre l&apos;inscription
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="lg:col-span-4 bg-white p-6 rounded-2xl ring-1 ring-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Aperçu rapide</p>
                <h3 className="text-base font-bold text-slate-900">Statistiques d&apos;inscription</h3>
              </div>
              <span className="text-[10px] font-semibold text-slate-500">{registrations.length} membres</span>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <div className="text-xs text-slate-500 uppercase tracking-[0.2em] mb-2">Message d&apos;accompagnement</div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Rejoignez le réseau étudiant du BS-Lokossa et bénéficiez d&apos;un accompagnement sur vos droits académiques, vos cotisations et votre vie étudiante.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200">
                  <p className="text-2xl font-bold text-emerald-800">{registrations.filter((r) => r.category === "membre_feua").length}</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-700">Adhésions FEUA</p>
                </div>
                <div className="rounded-2xl bg-blue-50 p-4 border border-blue-200">
                  <p className="text-2xl font-bold text-blue-800">{registrations.filter((r) => r.category === "etudiant_landa").length}</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-blue-700">Étudiants Landa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "card" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl ring-1 ring-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Carte Membre</p>
                <h3 className="text-base font-bold text-slate-900">Aperçu des derniers inscrits</h3>
              </div>
              <span className="text-[10px] font-semibold text-slate-500">Sélectionnable</span>
            </div>

            <div className="space-y-3">
              {registrations.map((record) => (
                <button
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className="w-full text-left rounded-2xl bg-slate-50 p-4 border border-slate-200 hover:bg-feua/5 transition"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{record.fullName}</p>
                      <p className="text-[11px] text-slate-500">{record.matricule}</p>
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em]">
                      {record.status}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white p-6 rounded-2xl ring-1 ring-slate-200/90 shadow-sm space-y-5">
            <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Détail Membre</p>
              {selectedRecord ? (
                <div className="space-y-3 pt-3 text-slate-700 text-sm">
                  <p className="font-bold text-slate-900">{selectedRecord.fullName}</p>
                  <p>{selectedRecord.matricule}</p>
                  <p>{selectedRecord.email}</p>
                  <p>{selectedRecord.entite}</p>
                  <p>{selectedRecord.filiere} • {selectedRecord.niveau}</p>
                  <p className="text-[11px] text-slate-500">Cotisation: {selectedRecord.cotisationStatus}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Cliquez sur un membre pour afficher les détails.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "admin" && isAdminMode && (
        <div className="bg-white p-6 rounded-2xl ring-1 ring-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Gestion interne</p>
              <h3 className="text-base font-bold text-slate-900">Registre des inscriptions</h3>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Recherche..."
                className="w-full sm:w-72 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-feua/30"
              />
              <select
                value={adminCategoryFilter}
                onChange={(e) => setAdminCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-feua/30"
              >
                <option value="all">Tous</option>
                <option value="membre_feua">Membre FEUA</option>
                <option value="etudiant_landa">Étudiant Landa</option>
                <option value="membre_bureau">Membre Bureau</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredAdminRegistrations.map((record) => (
              <div key={record.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{record.fullName}</p>
                    <p className="text-[11px] text-slate-500">{record.matricule} • {record.category}</p>
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 rounded-full bg-slate-100 px-3 py-1">
                    {record.status}
                  </div>
                </div>
                {onUpdateRegistrationStatus && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => onUpdateRegistrationStatus(record.id, "Validé")}
                      className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 text-white text-[11px] font-semibold"
                    >
                      Valider
                    </button>
                    <button
                      onClick={() => onUpdateRegistrationStatus(record.id, "Rejeté")}
                      className="flex-1 px-3 py-2 rounded-xl bg-rose-500 text-white text-[11px] font-semibold"
                    >
                      Rejeter
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
