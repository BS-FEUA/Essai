"use client";

import React, { useState } from "react";
import {
  UserPlus,
  ShieldCheck,
  GraduationCap,
  Users,
  QrCode,
  CheckCircle2,
  Clock,
  XCircle,
  KeyRound,
  Download,
  Building2,
  Search,
  Filter,
  ArrowRight,
  Printer,
  Sparkles,
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

  // Form State
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
  const [photoUrl, setPhotoUrl] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80");
  const [cotisationPaid, setCotisationPaid] = useState(true);

  // Card view state
  const [selectedRecord, setSelectedRecord] = useState<RegistrationRecord | null>(
    registrations.length > 0 ? registrations[0] : null
  );

  // Admin Search/Filter
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
      {/* Header Banner */}
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
                Portail officiel d&apos;adhésion au Bureau Syndical de Lokossa pour les étudiants IUT, ENSET & InstI.
              </p>
            </div>
          </div>

          {/* Sub Navigation Pills */}
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

      {/* SUB-TAB 1: Formulaire d'inscription */}
      {activeSubTab === "form" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Column */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl ring-1 ring-slate-200/90 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-feua" />
                Formulaire d&apos;Adhésion Multi-Profils
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Remplissez vos coordonnées exactes pour obtenir votre Carte d&apos;Adhérent Syndicale Numérique.
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
                {/* User Category Selection Cards */}
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
                      <div className="font-bold text-xs text-slate-900">
                        Membre Adhérent FEUA
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Étudiant régulier (IUT / ENSET) souhaitant adhérer au bureau syndical.
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
                      <div className="font-bold text-xs text-slate-900">
                        Étudiant Landa (Public)
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Pour accès libre aux communiqués, commandes d&apos;uniformes et convocations.
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
                        <ShieldCheck className="w-5 h-5 text-amber-600" />
                        {category === "membre_bureau" && (
                          <CheckCircle2 className="w-4 h-4 text-amber-600 fill-amber-100" />
                        )}
                      </div>
                      <div className="font-bold text-xs text-slate-900">
                        Membre du Bureau Exécutif
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Élu syndical ou délégué d&apos;amphi muni d&apos;une clé d&apos;activation.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secret Key input if Bureau Member */}
                {category === "membre_bureau" && (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-2">
                    <label className="block text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-amber-600" />
                      Clé d&apos;activation Exécutive (Fournie par le Master) :
                    </label>
                    <input
                      type="text"
                      value={invitationCode}
                      onChange={(e) => setInvitationCode(e.target.value)}
                      placeholder="Ex: FEUA-BS-2026-KEY"
                      required
                      className="w-full text-xs font-mono bg-white p-2.5 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />

                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Poste au sein du Bureau Syndical :
                      </label>
                      <select
                        value={bureauRole}
                        onChange={(e) => setBureauRole(e.target.value as UserRole)}
                        className="w-full text-xs bg-white p-2.5 rounded-lg border border-slate-300"
                      >
                        {Object.entries(ROLE_INFOS).map(([code, info]) => (
                          <option key={code} value={code}>
                            {info.title} — {info.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Personal Information */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    2. Informations Personnelles :
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">Nom & Prénoms *</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ex: Marius SODJINOU"
                        required
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-feua/30 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">Matricule Étudiant *</label>
                      <input
                        type="text"
                        value={matricule}
                        onChange={(e) => setMatricule(e.target.value)}
                        placeholder="Ex: 2024-LOK-0492"
                        required
                        className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-feua/30 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">Adresse Email *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="etudiant@student.feua.bj"
                        required
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-feua/30 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">Numéro WhatsApp / Téléphone</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+229 97 00 00 00"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-feua/30 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    3. Parcours Académique sur le Campus de Lokossa :
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">Établissement / Entité</label>
                      <select
                        value={entite}
                        onChange={(e) => setEntite(e.target.value as any)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                      >
                        <option value="IUT Lokossa">IUT de Lokossa</option>
                        <option value="ENSET Lokossa">ENSET de Lokossa</option>
                        <option value="InstI Lokossa">InstI Lokossa</option>
                        <option value="Autre">Autre Institution</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">Filière d&apos;Étude</label>
                      <input
                        type="text"
                        value={filiere}
                        onChange={(e) => setFiliere(e.target.value)}
                        placeholder="Ex: Informatique de Gestion"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">Niveau d&apos;Étude</label>
                      <select
                        value={niveau}
                        onChange={(e) => setNiveau(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                      >
                        <option value="Licence 1">Licence 1</option>
                        <option value="Licence 2">Licence 2</option>
                        <option value="Licence 3">Licence 3</option>
                        <option value="Master 1">Master 1</option>
                        <option value="Master 2">Master 2</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Cotisation statutory check */}
                {category === "membre_feua" && (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-bold text-xs text-emerald-950">
                        Cotisation Syndicale Statutaire (500 FCFA/an)
                      </div>
                      <div className="text-[11px] text-emerald-800">
                        Inclure immédiatement le règlement de la cotisation pour valider ma carte syndicale.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={cotisationPaid}
                      onChange={(e) => setCotisationPaid(e.target.checked)}
                      className="w-5 h-5 accent-feua cursor-pointer"
                    />
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-feua hover:bg-feua-dark text-white font-bold text-sm py-3.5 rounded-xl shadow transition flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5 text-amber-300" />
                  <span>Valider mon Inscription & Générer Ma Carte</span>
                </button>
              </form>
            )}
          </div>

          {/* Side Info & Live Preview */}
          <div className="lg:col-span-4 space-y-4">
            {/* Live Virtual Card Preview */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-800 space-y-4 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />

              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-feua flex items-center justify-center font-black text-amber-300 text-xs">
                    FEUA
                  </div>
                  <div>
                    <div className="text-xs font-black tracking-tight text-white">
                      CARTE D&apos;ADHÉRENT BS-LOKOSSA
                    </div>
                    <div className="text-[9px] text-emerald-400 font-mono">
                      ÉDITION OFFICIELLE 2025-2026
                    </div>
                  </div>
                </div>

                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>

              <div className="flex items-start gap-3">
                <img
                  src={photoUrl}
                  alt="Aperçu"
                  className="w-16 h-16 rounded-xl object-cover ring-2 ring-emerald-500/50"
                />

                <div className="space-y-1 text-xs">
                  <div className="font-extrabold text-white">
                    {fullName || "Nom & Prénoms"}
                  </div>
                  <div className="text-[11px] text-amber-300 font-mono">
                    Matricule: {matricule || "2026-LOK-XXXX"}
                  </div>
                  <div className="text-[10px] text-slate-300">
                    {entite} • {filiere || "Filière non spécifiée"}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {niveau}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {category === "membre_feua"
                      ? "Adhérent FEUA"
                      : category === "membre_bureau"
                      ? "Élu Exécutif BS"
                      : "Étudiant Landa"}
                  </span>
                </div>

                <QrCode className="w-8 h-8 text-slate-300" />
              </div>
            </div>

            {/* Advantages Box */}
            <div className="bg-white p-5 rounded-2xl ring-1 ring-slate-200/90 shadow-sm space-y-3">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-feua" />
                Avantages de l&apos;Adhésion Syndicale :
              </h4>

              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Prise en charge prioritaire des réclamations de notes & TP.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Accès gratuit aux polycopiés et séances de tutorat.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Assistance sociale d&apos;urgence en cas d&apos;hospitalisation.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Espace Membre / Consultation Carte */}
      {activeSubTab === "card" && (
        <div className="space-y-6">
          {/* Member Card Viewer */}
          <div className="bg-white p-6 rounded-2xl ring-1 ring-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-feua" />
                  Consultation des Cartes d&apos;Adhérents Enregistrées
                </h3>
                <p className="text-xs text-slate-500">
                  Sélectionnez un membre pour afficher sa carte d&apos;identité syndicale officielle certifiée.
                </p>
              </div>

              {/* Selector */}
              <select
                value={selectedRecord?.id || ""}
                onChange={(e) => {
                  const rec = registrations.find((r) => r.id === e.target.value);
                  if (rec) setSelectedRecord(rec);
                }}
                className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800"
              >
                {registrations.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.fullName} ({r.matricule}) — {r.category}
                  </option>
                ))}
              </select>
            </div>

            {selectedRecord && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Official Virtual Badge Card */}
                <div className="md:col-span-7 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 text-white rounded-2xl p-6 shadow-xl border border-emerald-500/40 relative overflow-hidden space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-feua flex items-center justify-center font-black text-amber-300 text-sm shadow">
                        FEUA
                      </div>
                      <div>
                        <div className="text-xs font-black text-amber-300 uppercase tracking-widest">
                          FEUA • BS-LOKOSSA
                        </div>
                        <div className="text-sm font-extrabold text-white">
                          CARTE D&apos;ADHÉRENT SYNDICAL
                        </div>
                      </div>
                    </div>

                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                      {selectedRecord.status}
                    </span>
                  </div>

                  <div className="flex items-start gap-4">
                    <img
                      src={
                        selectedRecord.photoUrl ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
                      }
                      alt={selectedRecord.fullName}
                      className="w-20 h-20 rounded-2xl object-cover ring-2 ring-emerald-400 shadow-md"
                    />

                    <div className="space-y-1 text-xs">
                      <h4 className="text-base font-black text-white">
                        {selectedRecord.fullName}
                      </h4>
                      <div className="font-mono text-amber-300 text-xs font-bold">
                        N° MATRICULE: {selectedRecord.matricule}
                      </div>
                      <div className="text-slate-300 text-xs">
                        {selectedRecord.entite} • {selectedRecord.filiere}
                      </div>
                      <div className="text-slate-400 text-xs">
                        Niveau: {selectedRecord.niveau}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Statut Cotisation
                      </div>
                      <div className="text-emerald-400 font-bold">
                        {selectedRecord.cotisationStatus}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <QrCode className="w-10 h-10 text-slate-200" />
                    </div>
                  </div>
                </div>

                {/* Card Actions & Details */}
                <div className="md:col-span-5 space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Profil:</span>
                      <span className="font-bold text-slate-900 capitalize">
                        {selectedRecord.category.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Email:</span>
                      <span className="text-slate-900">{selectedRecord.email}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Téléphone / WhatsApp:</span>
                      <span className="text-slate-900">{selectedRecord.phone}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Date Inscription:</span>
                      <span className="text-slate-900">{selectedRecord.dateRegistered}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => window.print()}
                      className="flex-1 bg-feua hover:bg-feua-dark text-white font-bold text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <Printer className="w-4 h-4 text-amber-300" />
                      <span>Imprimer Carte</span>
                    </button>

                    <a
                      href={`mailto:${selectedRecord.email}`}
                      className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 text-center"
                    >
                      <span>Contacter Membre</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Espace Administrateur - Gestion des Inscriptions */}
      {activeSubTab === "admin" && isAdminMode && (
        <div className="bg-white p-6 rounded-2xl ring-1 ring-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                Registre des Demandes d&apos;Adhésions & Inscriptions
              </h3>
              <p className="text-xs text-slate-500">
                Validation par le Secrétariat Général (SE-G) et le Président du Bureau Syndical.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Rechercher nom, matricule..."
                  className="w-full text-xs bg-slate-50 pl-8 pr-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <select
                value={adminCategoryFilter}
                onChange={(e) => setAdminCategoryFilter(e.target.value)}
                className="text-xs bg-slate-50 p-2 rounded-xl border border-slate-200 font-medium"
              >
                <option value="all">Toutes catégories</option>
                <option value="membre_feua">Membre FEUA</option>
                <option value="etudiant_landa">Étudiant Landa</option>
                <option value="membre_bureau">Bureau Exécutif</option>
              </select>
            </div>
          </div>

          {/* Registrations List Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Étudiant</th>
                  <th className="p-3">Catégorie</th>
                  <th className="p-3">Matricule & Établissement</th>
                  <th className="p-3">Cotisation</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdminRegistrations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-bold text-slate-900">
                      <div>{rec.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{rec.email}</div>
                    </td>

                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          rec.category === "membre_feua"
                            ? "bg-emerald-100 text-emerald-800"
                            : rec.category === "membre_bureau"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {rec.category.replace("_", " ")}
                      </span>
                    </td>

                    <td className="p-3 font-mono text-slate-800">
                      <div>{rec.matricule}</div>
                      <div className="text-[10px] text-slate-500 font-sans">
                        {rec.entite} • {rec.niveau}
                      </div>
                    </td>

                    <td className="p-3 font-semibold text-emerald-700">
                      {rec.cotisationStatus}
                    </td>

                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rec.status === "Validé"
                            ? "bg-emerald-100 text-emerald-800"
                            : rec.status === "Rejeté"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {rec.status === "Validé" ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : rec.status === "Rejeté" ? (
                          <XCircle className="w-3 h-3 text-rose-600" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-600" />
                        )}
                        <span>{rec.status}</span>
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedRecord(rec);
                            setActiveSubTab("card");
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded text-[11px] font-medium"
                        >
                          Voir Carte
                        </button>

                        {rec.status !== "Validé" && onUpdateRegistrationStatus && (
                          <button
                            onClick={() => onUpdateRegistrationStatus(rec.id, "Validé")}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-[11px] font-medium"
                          >
                            Valider
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
