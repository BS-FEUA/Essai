"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroBanner } from "@/components/HeroBanner";
import { CommuniquesSection } from "@/components/CommuniquesSection";
import { BureauMembersSection } from "@/components/BureauMembersSection";
import { InscriptionSection } from "@/components/InscriptionSection";
import { RevendicationsSection } from "@/components/RevendicationsSection";
import { CotisationsSection } from "@/components/CotisationsSection";
import { EventsSection } from "@/components/EventsSection";
import { LibrarySection } from "@/components/LibrarySection";
import { Footer } from "@/components/Footer";

// Modals
import { CommuniqueModal } from "@/components/Modals/CommuniqueModal";
import { NewClaimModal } from "@/components/Modals/NewClaimModal";
import { NewCommuniqueModal } from "@/components/Modals/NewCommuniqueModal";
import { NewCotisationModal } from "@/components/Modals/NewCotisationModal";
import { InscriptionModal } from "@/components/Modals/InscriptionModal";

// Data
import {
  INITIAL_BUREAU_MEMBERS,
  INITIAL_COMMUNIQUES,
  INITIAL_CLAIMS,
  INITIAL_COTISATIONS,
  INITIAL_FINANCIAL_SUMMARY,
  INITIAL_EVENTS,
  INITIAL_DOCUMENTS,
  INITIAL_REGISTRATIONS,
} from "@/lib/data";
import { Communique, Claim, CotisationRecord, UnionEvent, ClaimStatus, UserRole, RegistrationRecord } from "@/types";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>("communiques");
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Persistent State
  const [communiques, setCommuniques] = useState<Communique[]>(INITIAL_COMMUNIQUES);
  const [claims, setClaims] = useState<Claim[]>(INITIAL_CLAIMS);
  const [cotisations, setCotisations] = useState<CotisationRecord[]>(INITIAL_COTISATIONS);
  const [events, setEvents] = useState<UnionEvent[]>(INITIAL_EVENTS);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>(INITIAL_REGISTRATIONS);
  const [documents] = useState(INITIAL_DOCUMENTS);
  const [financialSummary, setFinancialSummary] = useState(INITIAL_FINANCIAL_SUMMARY);

  // Modals state
  const [selectedCommuniqueModal, setSelectedCommuniqueModal] = useState<Communique | null>(null);
  const [isNewClaimOpen, setIsNewClaimOpen] = useState<boolean>(false);
  const [isNewCommuniqueOpen, setIsNewCommuniqueOpen] = useState<boolean>(false);
  const [isNewCotisationOpen, setIsNewCotisationOpen] = useState<boolean>(false);
  const [isInscriptionModalOpen, setIsInscriptionModalOpen] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedComm = localStorage.getItem("bs_lokossa_communiques");
      if (storedComm) setCommuniques(JSON.parse(storedComm));

      const storedClaims = localStorage.getItem("bs_lokossa_claims");
      if (storedClaims) setClaims(JSON.parse(storedClaims));

      const storedCotis = localStorage.getItem("bs_lokossa_cotisations");
      if (storedCotis) setCotisations(JSON.parse(storedCotis));

      const storedEvents = localStorage.getItem("bs_lokossa_events");
      if (storedEvents) setEvents(JSON.parse(storedEvents));

      const storedRegs = localStorage.getItem("bs_lokossa_registrations");
      if (storedRegs) setRegistrations(JSON.parse(storedRegs));
    } catch (err) {
      console.error("Failed to load local state:", err);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("bs_lokossa_communiques", JSON.stringify(communiques));
    } catch {}
  }, [communiques]);

  useEffect(() => {
    try {
      localStorage.setItem("bs_lokossa_claims", JSON.stringify(claims));
    } catch {}
  }, [claims]);

  useEffect(() => {
    try {
      localStorage.setItem("bs_lokossa_cotisations", JSON.stringify(cotisations));
    } catch {}
  }, [cotisations]);

  useEffect(() => {
    try {
      localStorage.setItem("bs_lokossa_events", JSON.stringify(events));
    } catch {}
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem("bs_lokossa_registrations", JSON.stringify(registrations));
    } catch {}
  }, [registrations]);

  // Handlers
  const handleAddRegistration = (
    recData: Omit<RegistrationRecord, "id" | "dateRegistered" | "status">
  ) => {
    const today = new Date().toISOString().split("T")[0];
    const newRecord: RegistrationRecord = {
      ...recData,
      id: `reg-${Date.now().toString().slice(-4)}`,
      dateRegistered: today,
      status: "Validé",
    };
    setRegistrations([newRecord, ...registrations]);
  };

  const handleUpdateRegistrationStatus = (id: string, newStatus: "Validé" | "Rejeté") => {
    setRegistrations(
      registrations.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  // Handlers
  const handleCreateClaim = (
    newClaimData: Omit<Claim, "id" | "dateSubmitted" | "status" | "updatedAt">
  ) => {
    const today = new Date().toISOString().split("T")[0];
    const newClaim: Claim = {
      ...newClaimData,
      id: `clm-${Date.now().toString().slice(-4)}`,
      dateSubmitted: today,
      status: "Soumis",
      updatedAt: today,
    };

    setClaims([newClaim, ...claims]);
    setActiveTab("revendications");
  };

  const handleUpdateClaimStatus = (
    claimId: string,
    newStatus: ClaimStatus,
    adminResponse?: string,
    assignedRole?: UserRole
  ) => {
    const today = new Date().toISOString().split("T")[0];
    setClaims(
      claims.map((c) =>
        c.id === claimId
          ? {
              ...c,
              status: newStatus,
              adminResponse: adminResponse ?? c.adminResponse,
              assignedRole: assignedRole ?? c.assignedRole,
              updatedAt: today,
            }
          : c
      )
    );
  };

  const handleCreateCommunique = (newCommData: Omit<Communique, "id">) => {
    const newComm: Communique = {
      ...newCommData,
      id: `comm-${Date.now().toString().slice(-4)}`,
    };

    setCommuniques([newComm, ...communiques]);
    setActiveTab("communiques");
  };

  const handleCreateCotisation = (
    newCotData: Omit<CotisationRecord, "id" | "receiptNumber" | "status">
  ) => {
    const newCot: CotisationRecord = {
      ...newCotData,
      id: `cot-${Date.now().toString().slice(-4)}`,
      receiptNumber: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "Validé",
    };

    setCotisations([newCot, ...cotisations]);
    setFinancialSummary((prev) => ({
      ...prev,
      totalCollected: prev.totalCollected + newCotData.amount,
      balance: prev.balance + newCotData.amount,
      contributorCount: prev.contributorCount + 1,
    }));
    setActiveTab("cotisations");
  };

  const handleRegisterEvent = (eventId: string) => {
    setEvents(
      events.map((e) =>
        e.id === eventId
          ? { ...e, registeredCount: e.registeredCount + 1 }
          : e
      )
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 antialiased font-sans">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdminMode={isAdminMode}
        setIsAdminMode={setIsAdminMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenNewClaim={() => setIsNewClaimOpen(true)}
        onOpenInscription={() => setIsInscriptionModalOpen(true)}
      />

      {/* Top Banner Hero */}
      <HeroBanner
        onOpenNewClaim={() => setIsNewClaimOpen(true)}
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenInscription={() => setIsInscriptionModalOpen(true)}
        claimCount={claims.filter((c) => c.status !== "Résolu").length}
        communiqueCount={communiques.length}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "communiques" && (
          <CommuniquesSection
            communiques={communiques}
            isAdminMode={isAdminMode}
            searchQuery={searchQuery}
            onOpenNewCommunique={() => setIsNewCommuniqueOpen(true)}
            onViewCommunique={(c) => setSelectedCommuniqueModal(c)}
          />
        )}

        {activeTab === "inscription" && (
          <div className="space-y-4">
            <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3 shadow">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-semibold text-slate-200">
                  Mode Fenêtre disponible pour le Portail d&apos;Inscription
                </span>
              </div>
              <button
                onClick={() => setIsInscriptionModalOpen(true)}
                className="bg-feua hover:bg-feua-dark text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shadow flex items-center gap-1.5"
              >
                <span>Ouvrir dans une Fenêtre Dédiée</span>
              </button>
            </div>

            <InscriptionSection
              registrations={registrations}
              isAdminMode={isAdminMode}
              onAddRegistration={handleAddRegistration}
              onUpdateRegistrationStatus={handleUpdateRegistrationStatus}
            />
          </div>
        )}

        {activeTab === "bureau" && (
          <BureauMembersSection
            members={INITIAL_BUREAU_MEMBERS}
            isAdminMode={isAdminMode}
          />
        )}

        {activeTab === "revendications" && (
          <RevendicationsSection
            claims={claims}
            isAdminMode={isAdminMode}
            onOpenNewClaim={() => setIsNewClaimOpen(true)}
            onUpdateClaimStatus={handleUpdateClaimStatus}
          />
        )}

        {activeTab === "cotisations" && (
          <CotisationsSection
            cotisations={cotisations}
            summary={financialSummary}
            isAdminMode={isAdminMode}
            onOpenNewCotisation={() => setIsNewCotisationOpen(true)}
          />
        )}

        {activeTab === "evenements" && (
          <EventsSection
            events={events}
            isAdminMode={isAdminMode}
            onOpenNewEvent={() => {}}
            onRegisterEvent={handleRegisterEvent}
          />
        )}

        {activeTab === "bibliotheque" && (
          <LibrarySection
            documents={documents}
            searchQuery={searchQuery}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Modals */}
      <CommuniqueModal
        communique={selectedCommuniqueModal}
        onClose={() => setSelectedCommuniqueModal(null)}
      />

      <NewClaimModal
        isOpen={isNewClaimOpen}
        onClose={() => setIsNewClaimOpen(false)}
        onSubmit={handleCreateClaim}
      />

      <NewCommuniqueModal
        isOpen={isNewCommuniqueOpen}
        onClose={() => setIsNewCommuniqueOpen(false)}
        onSubmit={handleCreateCommunique}
      />

      <NewCotisationModal
        isOpen={isNewCotisationOpen}
        onClose={() => setIsNewCotisationOpen(false)}
        onSubmit={handleCreateCotisation}
      />

      <InscriptionModal
        isOpen={isInscriptionModalOpen}
        onClose={() => setIsInscriptionModalOpen(false)}
        registrations={registrations}
        isAdminMode={isAdminMode}
        onAddRegistration={handleAddRegistration}
        onUpdateRegistrationStatus={handleUpdateRegistrationStatus}
      />
    </div>
  );
}
