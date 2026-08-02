'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { CommuniquesSection } from '@/components/CommuniquesSection';
import { InscriptionSection } from '@/components/InscriptionSection';
import { BureauMembersSection } from '@/components/BureauMembersSection';
import { RevendicationsSection } from '@/components/RevendicationsSection';
import { CotisationsSection } from '@/components/CotisationsSection';
import { EventsSection } from '@/components/EventsSection';
import { LibrarySection } from '@/components/LibrarySection';
import { Footer } from '@/components/layout/Footer';
import { NewClaimModal } from '@/components/Modals/NewClaimModal';
import { NewCommuniqueModal } from '@/components/Modals/NewCommuniqueModal';
import { CommuniqueModal } from '@/components/Modals/CommuniqueModal';
import { InscriptionModal } from '@/components/Modals/InscriptionModal';

import {
  INITIAL_BUREAU_MEMBERS,
  INITIAL_COMMUNIQUES,
  INITIAL_CLAIMS,
  INITIAL_COTISATIONS,
  INITIAL_FINANCIAL_SUMMARY,
  INITIAL_EVENTS,
  INITIAL_DOCUMENTS,
  INITIAL_REGISTRATIONS,
} from '@/lib/data';

import { Communique, Claim, UnionEvent, ClaimStatus, UserRole, RegistrationRecord } from '@/types';
import { AlertTriangle, X, LogIn, Globe, ShieldCheck, UserCheck } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

function AnnouncementsTicker({ announcements }: { announcements: any[] }) {
  const [idx, setIdx] = useState(0);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % announcements.length), 5000);
    return () => clearInterval(t);
  }, [announcements.length]);

  if (closed || announcements.length === 0) return null;
  const a = announcements[idx];

  return (
    <div className={`relative py-2 px-4 text-center text-xs sm:text-sm font-medium ${a?.isUrgent ? 'bg-[var(--feua-gold)]/20 text-amber-900 dark:text-amber-200 border-b border-[var(--feua-gold)]/30' : 'bg-emerald-700 text-white border-b border-emerald-600'}`}>
      <button onClick={() => setClosed(true)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 transition-colors">
        <X className="h-3.5 w-3.5" />
      </button>
      <AnimatePresence mode="wait">
        <motion.p key={a?.id || idx} {...pageVariants} className="truncate max-w-4xl mx-auto pr-6">
          {a?.isUrgent && <AlertTriangle className="inline h-4 w-4 mr-1 text-amber-400" />}
          <span className="font-bold">{a?.title}</span>{a?.content ? ` — ${a.content}` : ''}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export function LandingView() {
  const { announcements, member } = useAppStore();

  // Navigation & State
  const [activeTab, setActiveTab] = useState<string>('communiques');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Local state for dynamic list interactions
  const [communiques, setCommuniques] = useState<Communique[]>(INITIAL_COMMUNIQUES);
  const [claims, setClaims] = useState<Claim[]>(INITIAL_CLAIMS);
  const [events, setEvents] = useState<UnionEvent[]>(INITIAL_EVENTS);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>(INITIAL_REGISTRATIONS);

  const handleAddRegistration = (record: Omit<RegistrationRecord, "id" | "dateRegistered" | "status">) => {
    const newReg: RegistrationRecord = {
      ...record,
      id: `reg-${Date.now()}`,
      dateRegistered: new Date().toISOString().split('T')[0],
      status: 'Validé',
    };
    setRegistrations([newReg, ...registrations]);
  };

  const handleUpdateRegistrationStatus = (id: string, newStatus: "Validé" | "Rejeté") => {
    setRegistrations(registrations.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  // Modals state
  const [isNewClaimOpen, setIsNewClaimOpen] = useState(false);
  const [isNewCommuniqueOpen, setIsNewCommuniqueOpen] = useState(false);
  const [selectedCommunique, setSelectedCommunique] = useState<Communique | null>(null);
  const [isInscriptionModalOpen, setIsInscriptionModalOpen] = useState(false);

  // Action handlers
  const handleAddClaim = (claimData: Omit<Claim, 'id' | 'dateSubmitted' | 'status' | 'updatedAt'>) => {
    const newClaim: Claim = {
      ...claimData,
      id: `claim-${Date.now()}`,
      dateSubmitted: new Date().toISOString().split('T')[0],
      status: 'Soumis',
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setClaims([newClaim, ...claims]);
    setIsNewClaimOpen(false);
    setActiveTab('revendications');
  };

  const handleAddCommunique = (communiqueData: Omit<Communique, 'id' | 'date' | 'authorRole'>) => {
    const newCommunique: Communique = {
      ...communiqueData,
      id: `com-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      authorRole: 'min',
    };
    setCommuniques([newCommunique, ...communiques]);
    setIsNewCommuniqueOpen(false);
  };

  const handleUpdateClaimStatus = (
    claimId: string,
    newStatus: ClaimStatus,
    adminResponse?: string,
    assignedRole?: UserRole
  ) => {
    setClaims(
      claims.map((c) =>
        c.id === claimId
          ? {
              ...c,
              status: newStatus,
              adminResponse: adminResponse || c.adminResponse,
              assignedRole: assignedRole || c.assignedRole,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : c
      )
    );
  };

  const handleRegisterEvent = (eventId: string) => {
    setEvents(
      events.map((e) =>
        e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e
      )
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Announcement Bar */}
      <AnnouncementsTicker announcements={announcements} />

      {/* Main Sticky Navbar containing all key tabs & portal controls */}
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

      {/* Top Banner with Key Actions & Stats */}
      <HeroBanner
        onOpenNewClaim={() => setIsNewClaimOpen(true)}
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenInscription={() => setIsInscriptionModalOpen(true)}
        claimCount={claims.length}
        communiqueCount={communiques.length}
      />

      {/* Quick Navigation / Account Switch bar */}
      <div className="bg-emerald-950/90 text-white border-b border-emerald-800/80 py-2 px-4 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Portail Étudiant BS-Lokossa (FEUA) — Campus IUT & ENSET</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Link href="/landa">
              <button className="px-3 py-1.5 rounded-lg bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 font-semibold border border-amber-400/30 transition flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Espace Landa (Public)</span>
              </button>
            </Link>

            {member ? (
              <Link href="/dashboard">
                <button className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition flex items-center gap-1.5 border border-emerald-400/30">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Mon Tableau de Bord</span>
                </button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <button className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center gap-1.5 shadow-sm">
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Se connecter</span>
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-3 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold transition flex items-center gap-1.5 border border-amber-400/30">
                    <span>Créer un compte</span>
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin / Bureau Mode Active Banner */}
      {isAdminMode && (
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-600/30 to-amber-500/20 border-b border-amber-500/40 text-amber-200 py-2.5 px-4 shadow-inner backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs font-bold">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>MODE BUREAU EXÉCUTIF ACTIF — Vous pouvez créer des communiqués, gérer les plaintes et modérer le portail.</span>
            </div>
            <button
              onClick={() => setIsAdminMode(false)}
              className="text-[11px] underline hover:text-white transition font-medium"
            >
              Passer en vue étudiant ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Tab Content Display */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} {...pageVariants}>
            {activeTab === 'communiques' && (
              <CommuniquesSection
                communiques={communiques}
                isAdminMode={isAdminMode}
                searchQuery={searchQuery}
                onOpenNewCommunique={() => setIsNewCommuniqueOpen(true)}
                onViewCommunique={(item) => setSelectedCommunique(item)}
              />
            )}

            {activeTab === 'inscription' && (
              <InscriptionSection
                registrations={registrations}
                isAdminMode={isAdminMode}
                onAddRegistration={handleAddRegistration}
                onUpdateRegistrationStatus={handleUpdateRegistrationStatus}
              />
            )}

            {activeTab === 'bureau' && (
              <BureauMembersSection
                members={INITIAL_BUREAU_MEMBERS}
                isAdminMode={isAdminMode}
              />
            )}

            {activeTab === 'revendications' && (
              <RevendicationsSection
                claims={claims}
                isAdminMode={isAdminMode}
                onOpenNewClaim={() => setIsNewClaimOpen(true)}
                onUpdateClaimStatus={handleUpdateClaimStatus}
              />
            )}

            {activeTab === 'cotisations' && (
              <CotisationsSection
                cotisations={INITIAL_COTISATIONS}
                summary={INITIAL_FINANCIAL_SUMMARY}
                isAdminMode={isAdminMode}
                onOpenNewCotisation={() => alert("Formulaire de cotisation restreint au Trésorier Général.")}
              />
            )}

            {activeTab === 'evenements' && (
              <EventsSection
                events={events}
                isAdminMode={isAdminMode}
                onOpenNewEvent={() => alert("Création d'événements disponible en espace administration.")}
                onRegisterEvent={handleRegisterEvent}
              />
            )}

            {activeTab === 'bibliotheque' && (
              <LibrarySection
                documents={INITIAL_DOCUMENTS}
                searchQuery={searchQuery}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modals */}
      <NewClaimModal
        isOpen={isNewClaimOpen}
        onClose={() => setIsNewClaimOpen(false)}
        onSubmit={handleAddClaim}
      />

      <NewCommuniqueModal
        isOpen={isNewCommuniqueOpen}
        onClose={() => setIsNewCommuniqueOpen(false)}
        onSubmit={handleAddCommunique}
      />

      <CommuniqueModal
        communique={selectedCommunique}
        onClose={() => setSelectedCommunique(null)}
      />

      <InscriptionModal
        isOpen={isInscriptionModalOpen}
        onClose={() => setIsInscriptionModalOpen(false)}
        registrations={registrations}
        isAdminMode={isAdminMode}
        onAddRegistration={handleAddRegistration}
        onUpdateRegistrationStatus={handleUpdateRegistrationStatus}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
