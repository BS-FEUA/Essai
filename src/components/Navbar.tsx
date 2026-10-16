"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  Megaphone,
  CreditCard,
  Calendar,
  FolderDown,
  Menu,
  X,
  Search,
  PhoneCall,
  UserPlus,
  LogIn,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAppStore } from "@/lib/store";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdminMode: boolean;
  setIsAdminMode: (mode: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenNewClaim: () => void;
  onOpenInscription?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdminMode,
  setIsAdminMode,
  searchQuery,
  setSearchQuery,
  onOpenNewClaim,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { member, logout } = useAppStore();

  const toggleAdminMode = (targetMode: boolean) => {
    setIsAdminMode(targetMode);
    if (targetMode) {
      toast({
        title: "🛡️ Mode Bureau Exécutif Activé",
        description: "Droits d'édition déverrouillés (publication de communiqués, suivi des plaintes).",
      });
    } else {
      toast({
        title: "🎓 Mode Étudiant Activé",
        description: "Affichage standard pour les étudiants du campus.",
      });
    }
  };

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
    <header className="sticky top-0 z-40 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-xl text-white shadow-xl border-b border-emerald-500/30">
      {/* Top Info Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 py-1.5 px-4 text-xs font-medium text-slate-100 flex items-center justify-between border-b border-emerald-500/20">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-md text-[10px] tracking-wider uppercase flex-shrink-0 shadow-sm animate-pulse">
              INFO BS
            </span>
            <span className="truncate text-slate-200">
              Permanence du Bureau sectoriel au Bâtiment BS - Du Lundi au Vendredi de 08h à 17h.
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-300 text-xs">
            <a
              href="tel:+22997421890"
              className="hover:text-amber-300 transition flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span>Ligne Directe BS: +229 97 42 18 90</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo */}
          <div
            onClick={() => setActiveTab("communiques")}
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center font-black text-amber-300 text-xl shadow-lg border border-amber-400/30 group-hover:scale-105 transition-transform">
              BS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-white tracking-tight">BS-Lokossa</span>
                <span className="text-[10px] uppercase font-extrabold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-md border border-emerald-400/40">
                  FEUA
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium leading-none hidden sm:block">
                Bureau Sectoriel - Campus de Lokossa (INSTI & ENSET)
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs relative">
            <Search className="w-4 h-4 absolute left-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un communiqué, un doc..."
              className="w-full bg-slate-950/80 text-xs text-white pl-9 pr-3 py-2 rounded-2xl border border-slate-700/80 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 placeholder-slate-400 backdrop-blur-md"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenNewClaim}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-md transition flex items-center gap-1.5 border border-emerald-400/30"
            >
              <ShieldAlert className="w-4 h-4 text-amber-300" />
              <span>Plainte</span>
            </button>

            {member ? (
              <>
                <Link href="/dashboard">
                  <button
                    type="button"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-md transition flex items-center gap-1.5 border border-emerald-400/40"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-200" />
                    <span>Mon Espace</span>
                  </button>
                </Link>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 font-bold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-red-500/30"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <button
                    type="button"
                    className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 font-bold text-xs px-3 py-2 rounded-xl shadow-md transition flex items-center gap-1.5 border border-amber-400/40"
                  >
                    <LogIn className="w-4 h-4 text-amber-400" />
                    <span>Connexion</span>
                  </button>
                </Link>

                <Link href="/register">
                  <button
                    type="button"
                    className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-emerald-400/40"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-400" />
                    <span>Créer un compte</span>
                  </button>
                </Link>
              </>
            )}

            {/* Segmented Mode Toggle Pill */}
            <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-700/80 shadow-inner">
              <button
                type="button"
                onClick={() => toggleAdminMode(false)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  !isAdminMode
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Affichage public étudiant"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Vue Étudiant</span>
              </button>

              <button
                type="button"
                onClick={() => toggleAdminMode(true)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  isAdminMode
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-amber-300"
                }`}
                title="Déverrouiller les commandes d'administration du bureau"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Mode Bureau</span>
              </button>
            </div>
          </div>

          {/* Mobile Buttons */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => toggleAdminMode(!isAdminMode)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 ${
                isAdminMode
                  ? "bg-amber-500 text-slate-950 border-amber-400"
                  : "bg-emerald-600 text-white border-emerald-500"
              }`}
            >
              {isAdminMode ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
              <span>{isAdminMode ? "Bureau" : "Étudiant"}</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Links */}
      <div className="bg-slate-950/90 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-950/60 border border-emerald-400/40 scale-[1.02]"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-amber-300" : "text-emerald-400/70"}`} />
                <span>{item.label}</span>
                {item.id === "inscription" && (
                  <span className="ml-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase">
                    Ouvert
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 border-b border-slate-800 px-4 py-4 space-y-3 backdrop-blur-xl">
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full bg-slate-900 text-xs text-white pl-9 pr-3 py-2 rounded-xl border border-slate-700"
            />
          </div>

          <div className="space-y-1.5 py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-left transition ${
                    isActive ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-amber-300" : "text-emerald-400/70"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.id === "inscription" && (
                    <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase">
                      Ouvert
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
            <Link href="/login" className="w-full">
              <button className="w-full py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold text-xs flex items-center justify-center gap-1.5">
                <LogIn className="w-4 h-4" /> Connexion
              </button>
            </Link>
            <Link href="/register" className="w-full">
              <button className="w-full py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold text-xs flex items-center justify-center gap-1.5">
                <UserPlus className="w-4 h-4" /> Créer un compte
              </button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

