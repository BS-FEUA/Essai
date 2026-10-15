"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getDemoSession, signOutDemo } from "@/lib/demo-auth";
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
  INITIAL_COMMUNIQUES,
  INITIAL_CLAIMS,
  INITIAL_COTISATIONS,
  INITIAL_FINANCIAL_SUMMARY,
  INITIAL_EVENTS,
  INITIAL_DOCUMENTS,
  INITIAL_REGISTRATIONS,
} from "@/lib/data";
import { Communique, Claim, CotisationRecord, UnionEvent, ClaimStatus, UserRole, RegistrationRecord } from "@/types";

const SECTION_IDS = ["communiques", "inscription", "bureau", "revendications", "cotisations", "evenements", "bibliotheque"];

function PortalPage({ initialTab = "communiques", isLanding = false }: { initialTab?: string; isLanding?: boolean }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>(isLanding ? "" : initialTab);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [canAccessOffice, setCanAccessOffice] = useState(false);

  useEffect(() => {
    if (activeTab && (isLanding || activeTab !== initialTab)) router.push(`/${activeTab}`);
  }, [activeTab, initialTab, isLanding, router]);

  // Persistent State
  const [communiques, setCommuniques] = useState<Communique[]>(INITIAL_COMMUNIQUES);
  const [claims, setClaims] = useState<Claim[]>(INITIAL_CLAIMS);
  const [cotisations, setCotisations] = useState<CotisationRecord[]>(INITIAL_COTISATIONS);
  const [events, setEvents] = useState<UnionEvent[]>(INITIAL_EVENTS);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>(INITIAL_REGISTRATIONS);
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
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
      const storedDocuments = localStorage.getItem("bs_lokossa_documents");
      if (storedDocuments) setDocuments(JSON.parse(storedDocuments));
    } catch (err) {
      console.error("Failed to load local state:", err);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      const updateDemoAccess = () => {
        const user = getDemoSession();
        setUserEmail(user?.email ?? null);
        setCanAccessOffice(Boolean(user && !["IGN", "AMC"].includes(user.role)));
        if (!user) setIsAdminMode(false);
      };
      updateDemoAccess();
      window.addEventListener("bs-demo-auth-change", updateDemoAccess);
      return () => window.removeEventListener("bs-demo-auth-change", updateDemoAccess);
    }
    const client = createClient();
    const updateAccess = (session: Awaited<ReturnType<typeof client.auth.getSession>>["data"]["session"]) => {
      setUserEmail(session?.user.email ?? null);
      const role = session?.user.app_metadata?.role;
      setCanAccessOffice(["CEO", "MAST_IN", "MAST", "MASTER", "MIX", "MIN", "admin", "bureau", "president"].includes(role));
    };
    client.auth.getSession().then(({ data }) => updateAccess(data.session));
    const { data: subscription } = client.auth.onAuthStateChange((_event, session) => {
      updateAccess(session);
      if (!session) setIsAdminMode(false);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    if (isSupabaseConfigured()) await createClient().auth.signOut(); else signOutDemo();
    setUserEmail(null);
    setCanAccessOffice(false);
    setIsAdminMode(false);
    router.push("/login");
  }

  useEffect(() => {
    if (isAdminMode) setActiveTab("inscription");
  }, [isAdminMode]);

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

  useEffect(() => {
    try { localStorage.setItem("bs_lokossa_documents", JSON.stringify(documents)); } catch {}
  }, [documents]);

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

  const handleDeleteCommunique = (id: string) => {
    if (window.confirm("Supprimer définitivement cette publication ?")) {
      setCommuniques((current) => current.filter((item) => item.id !== id));
    }
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

  const handleAddDocument = ({ file, title, category, description }: { file: File; title: string; category: typeof INITIAL_DOCUMENTS[number]["category"]; description: string }) => {
    setDocuments((current) => [{
      id: `doc-${Date.now()}`,
      title,
      category,
      fileSize: `${Math.max(1, Math.round(file.size / 1024))} Ko`,
      dateUploaded: new Date().toISOString().slice(0, 10),
      downloadCount: 0,
      description,
    }, ...current]);
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-900 antialiased font-sans">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdminMode={isAdminMode}
        setIsAdminMode={setIsAdminMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenNewClaim={() => isLanding ? setActiveTab("revendications") : setIsNewClaimOpen(true)}
        onOpenInscription={() => !isLanding && setIsInscriptionModalOpen(true)}
        userEmail={userEmail}
        canAccessOffice={canAccessOffice}
        onOpenLogin={() => router.push("/login")}
        onRequestOfficeAccess={() => userEmail ? window.alert("Votre compte est connecté, mais il ne dispose pas du rôle Bureau. Un administrateur doit vous attribuer le rôle admin, bureau ou president dans Supabase.") : router.push("/login")}
        onSignOut={handleSignOut}
      />

      {isLanding && (
        <HeroBanner
          onOpenNewClaim={() => setActiveTab("revendications")}
          onNavigate={(tab) => setActiveTab(tab)}
          claimCount={claims.filter((c) => c.status !== "Résolu").length}
          communiqueCount={communiques.length}
        />
      )}

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLanding ? (
          <section className="glass rounded-3xl p-6 sm:p-8">
            <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-feua">Notre bureau</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">Une représentation étudiante active, transparente et accessible.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">Le Bureau Syndical de Lokossa accompagne les étudiants de l’IUT et de l’ENSET : défense des droits, informations officielles, événements et services d’adhésion.</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
                <p className="text-sm font-bold text-emerald-950">Accès rapide</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-1">
                  <button onClick={() => setActiveTab("communiques")} className="rounded-xl bg-white px-3 py-2.5 text-left text-xs font-bold text-slate-800 shadow-sm ring-1 ring-emerald-100 hover:text-feua">Communiqués officiels</button>
                  <button onClick={() => setActiveTab("inscription")} className="rounded-xl bg-white px-3 py-2.5 text-left text-xs font-bold text-slate-800 shadow-sm ring-1 ring-emerald-100 hover:text-feua">Adhésion & espace membre</button>
                  <button onClick={() => setActiveTab("bureau")} className="rounded-xl bg-white px-3 py-2.5 text-left text-xs font-bold text-slate-800 shadow-sm ring-1 ring-emerald-100 hover:text-feua">Découvrir le Bureau exécutif</button>
                </div>
              </div>
            </div>
          </section>
        ) : <>
        {isAdminMode && (
          <section className="glass mb-6 rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-feua">Administration du Bureau</p>
                <h2 className="mt-1 text-lg font-extrabold text-slate-900">Gérez les inscriptions, publications et dossiers étudiants.</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setActiveTab("inscription")} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700">Valider les inscriptions</button>
                <button onClick={() => { setActiveTab("communiques"); setIsNewCommuniqueOpen(true); }} className="rounded-xl bg-feua px-3 py-2 text-xs font-bold text-white hover:bg-feua-dark">Publier un communiqué</button>
                <button onClick={() => setActiveTab("revendications")} className="rounded-xl border border-emerald-200 bg-white/80 px-3 py-2 text-xs font-bold text-feua hover:bg-emerald-50">Traiter les dossiers</button>
              </div>
            </div>
          </section>
        )}
        {activeTab === "communiques" && (
          <CommuniquesSection
            communiques={communiques}
            isAdminMode={isAdminMode}
            searchQuery={searchQuery}
            onOpenNewCommunique={() => setIsNewCommuniqueOpen(true)}
            onViewCommunique={(c) => setSelectedCommuniqueModal(c)}
            onDeleteCommunique={handleDeleteCommunique}
          />
        )}

        {activeTab === "inscription" && (
          <div className="space-y-4">
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
            members={[]}
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
            canUpload={canAccessOffice}
            onAddDocument={handleAddDocument}
          />
        )}
        </>}
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

export default function HomePage() {
  const pathname = usePathname();
  const section = pathname.slice(1);
  return section && SECTION_IDS.includes(section)
    ? <PortalPage key={section} initialTab={section} />
    : <PortalPage key="landing" isLanding />;
}
