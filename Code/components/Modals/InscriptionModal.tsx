"use client";

import React, { useState, useEffect } from "react";
import { X, Maximize2, Minimize2, ShieldCheck, UserPlus } from "lucide-react";
import { InscriptionSection } from "@/components/InscriptionSection";
import { RegistrationRecord } from "@/types";

interface InscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrations: RegistrationRecord[];
  isAdminMode: boolean;
  onAddRegistration: (record: Omit<RegistrationRecord, "id" | "dateRegistered" | "status">) => void;
  onUpdateRegistrationStatus?: (id: string, newStatus: "Validé" | "Rejeté") => void;
}

export const InscriptionModal: React.FC<InscriptionModalProps> = ({
  isOpen,
  onClose,
  registrations,
  isAdminMode,
  onAddRegistration,
  onUpdateRegistrationStatus,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-hidden">
      <div
        className={`bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 flex flex-col transition-all duration-300 w-full ${
          isMaximized
            ? "h-full max-w-none rounded-none border-none"
            : "max-w-5xl max-h-[92vh] h-[90vh]"
        }`}
      >
        {/* Window Title Bar Header */}
        <div className="bg-slate-900 text-white px-4 py-3 rounded-t-2xl flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Window Traffic Lights */}
            <div className="flex items-center gap-1.5 mr-2">
              <button
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 transition"
                title="Fermer la fenêtre"
              />
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600 transition"
                title="Agrandir / Réduire"
              />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>

            <div className="flex items-center gap-2 border-l border-slate-700 pl-3">
              <div className="w-6 h-6 rounded bg-feua flex items-center justify-center font-black text-[10px] text-amber-300">
                FEUA
              </div>
              <span className="text-xs font-bold text-white tracking-wide">
                Fenêtre : Portail d&apos;Inscription & Espace Membre BS-Lokossa
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title={isMaximized ? "Réduire la fenêtre" : "Agrandir la fenêtre"}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-rose-600/80 transition"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Window Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-slate-900">
          <InscriptionSection
            registrations={registrations}
            isAdminMode={isAdminMode}
            onAddRegistration={onAddRegistration}
            onUpdateRegistrationStatus={onUpdateRegistrationStatus}
          />
        </div>
      </div>
    </div>
  );
};
