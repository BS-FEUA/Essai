"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  FileText,
  Users,
  Megaphone,
  CreditCard,
  Calendar,
  FolderDown,
  Lock,
  Unlock,
  Menu,
  X,
  Search,
  Sparkles,
  PhoneCall,
  UserPlus,
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdminMode: boolean;
  setIsAdminMode: (mode: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenNewClaim: () => void;
  onOpenInscription?: () => void;
  userEmail?: string | null;
  canAccessOffice?: boolean;
  onRequestOfficeAccess?: () => void;
  onOpenLogin?: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdminMode,
  setIsAdminMode,
  searchQuery,
  setSearchQuery,
  onOpenNewClaim,
  onOpenInscription,
  userEmail,
  canAccessOffice = false,
  onRequestOfficeAccess,
  onOpenLogin,
  onSignOut,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "communiques", label: "Communiqués", icon: Megaphone },
    { id: "inscription", label: "Inscription & Espace Membre", icon: UserPlus },
    { id: "bureau", label: "Bureau Exécutif", icon: Users },
    { id: "revendications", label: "Revendications", icon: ShieldAlert },
    { id: "cotisations", label: "Cotisations & Bilan", icon: CreditCard },
    { id: "evenements", label: "Événements & AG", icon: Calendar },
    { id: "bibliotheque", label: "Bibliothèque", icon: FolderDown },
  ];

  return (
    <header className="sticky top-0 z-40 glass-dark text-white shadow-md">
      {/* Top emergency announcement bar */}
      <div className="bg-feua py-1.5 px-4 text-xs font-medium text-slate-100 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase flex-shrink-0 animate-pulse">
              INFO BS
            </span>
            <span className="truncate">
              Garde syndicale permanente au Bâtiment BS - Du Lundi au Vendredi de 08h à 17h.
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-200 text-xs">
            <a
              href="tel:+22997421890"
              className="hover:text-amber-300 transition flex items-center gap-1.5"
            >
              <PhoneCall className="w-3 h-3 text-amber-400" />
              <span>Ligne Directe BS: +229 97 42 18 90</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Branding */}
          <div
            onClick={() => setActiveTab("communiques")}
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-feua flex items-center justify-center font-black text-amber-300 text-xl shadow-inner border border-feua-light/20 group-hover:scale-105 transition-transform">
              BS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-100 tracking-tight">
                  BS-Lokossa
                </span>
                <span className="text-[10px] uppercase font-extrabold bg-feua-light/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  FEUA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-none hidden sm:block">
                Bureau Syndical - Campus de Lokossa (IUT & ENSET)
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs relative">
            <Search className="w-4 h-4 absolute left-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un communiqué, un doc..."
              className="w-full bg-slate-800/80 text-xs text-slate-100 pl-9 pr-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action & Executive Mode Switcher */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onOpenNewClaim}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-3.5 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5 border border-emerald-500/30"
            >
              <ShieldAlert className="w-4 h-4 text-amber-300" />
              <span>Soumettre une plainte</span>
            </button>

            <button
              onClick={() => canAccessOffice ? setIsAdminMode(!isAdminMode) : onRequestOfficeAccess?.()}
              className={`text-xs px-3 py-2 rounded-lg border font-medium transition flex items-center gap-1.5 ${
                isAdminMode
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
              }`}
              title={isAdminMode ? "Passer en vue Étudiant" : "Espace Membre du Bureau Executif"}
            >
              {isAdminMode ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mode Bureau Actif</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{canAccessOffice ? "Espace Bureau" : userEmail ? "Accès Bureau requis" : "Connexion Bureau"}</span>
                </>
              )}
            </button>
            <button onClick={onOpenLogin} className="text-xs font-semibold text-slate-200 transition hover:text-white">
              {userEmail ? "Changer de compte" : "Se connecter"}
            </button>
            {userEmail && <button onClick={onSignOut} title={userEmail} className="text-xs font-semibold text-slate-300 transition hover:text-white">Déconnexion</button>}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => canAccessOffice ? setIsAdminMode(!isAdminMode) : onRequestOfficeAccess?.()}
              className={`p-2 rounded-lg text-xs border ${
                isAdminMode
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                  : "bg-slate-800 text-slate-300 border-slate-700"
              }`}
            >
              {isAdminMode ? <Unlock className="w-4 h-4 text-amber-400" /> : <Lock className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation tabs row */}
      <div className="bg-slate-950/30 border-t border-white/10 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                  if (item.id === "inscription" && onOpenInscription) {
                    onOpenInscription();
                  }
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-feua text-white shadow-sm border border-emerald-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-amber-300" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-3">
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full bg-slate-800 text-xs text-slate-100 pl-9 pr-3 py-2 rounded-lg border border-slate-700"
            />
          </div>

          <div className="space-y-1 py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                    if (item.id === "inscription" && onOpenInscription) {
                      onOpenInscription();
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left transition ${
                    isActive
                      ? "bg-feua text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-amber-300" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                onOpenNewClaim();
                setMobileMenuOpen(false);
              }}
              className="w-full bg-emerald-600 text-white font-medium text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4 text-amber-300" />
              <span>Soumettre plainte</span>
            </button>
            <button
              onClick={() => {
                if (canAccessOffice) setIsAdminMode(!isAdminMode); else onRequestOfficeAccess?.();
                setMobileMenuOpen(false);
              }}
              className="w-full bg-slate-800 text-slate-200 border border-slate-700 text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5"
            >
              {isAdminMode ? "Quitter Mode Admin" : canAccessOffice ? "Espace Bureau BS" : userEmail ? "Accès Bureau requis" : "Connexion Bureau"}
            </button>
            <button
              onClick={() => { onOpenLogin?.(); setMobileMenuOpen(false); }}
              className="col-span-2 w-full py-2 text-xs font-semibold text-slate-300 hover:text-white"
            >
              {userEmail ? "Changer de compte" : "Se connecter"}
            </button>
            {userEmail && (
              <button
                onClick={() => { onSignOut?.(); setMobileMenuOpen(false); }}
                className="col-span-2 w-full py-1 text-xs font-semibold text-rose-300 hover:text-rose-200"
              >
                Déconnexion
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
