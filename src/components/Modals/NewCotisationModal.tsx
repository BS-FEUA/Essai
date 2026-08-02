"use client";

import React, { useState } from "react";
import { X, CreditCard } from "lucide-react";
import { CotisationRecord } from "@/types";

interface NewCotisationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: Omit<CotisationRecord, "id" | "receiptNumber" | "status">) => void;
}

export const NewCotisationModal: React.FC<NewCotisationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [studentName, setStudentName] = useState("");
  const [matricule, setMatricule] = useState("");
  const [filiere, setFiliere] = useState("Génie Électrique");
  const [niveau, setNiveau] = useState("Licence 2");
  const [amount, setAmount] = useState<number>(500);
  const [receivedBy, setReceivedBy] = useState("Gérard A. DOSSOU (Trésorier Général)");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !matricule) return;

    const today = new Date().toISOString().split("T")[0];

    onSubmit({
      studentName,
      matricule,
      filiere,
      niveau,
      amount,
      datePaid: today,
      receivedBy,
    });

    setStudentName("");
    setMatricule("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-feua" />
            <h2 className="text-base font-bold text-slate-900">Enregistrer un Reçu de Cotisation</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nom & Prénoms de l&apos;étudiant *</label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Ex: Marius SODJINOU"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Matricule / N° Carte Étudiant *</label>
            <input
              type="text"
              required
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              placeholder="Ex: 2024-LOK-0492"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Filière</label>
              <input
                type="text"
                required
                value={filiere}
                onChange={(e) => setFiliere(e.target.value)}
                placeholder="Ex: Informatique de Gestion"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Niveau</label>
              <select
                value={niveau}
                onChange={(e) => setNiveau(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none"
              >
                <option value="Licence 1">Licence 1</option>
                <option value="Licence 2">Licence 2</option>
                <option value="Licence 3">Licence 3</option>
                <option value="Master 1">Master 1</option>
                <option value="Master 2">Master 2</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Montant (FCFA)</label>
              <input
                type="number"
                required
                min={100}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none font-bold text-feua"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Percepteur</label>
              <input
                type="text"
                required
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100">
              Annuler
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl font-bold bg-feua text-white hover:bg-feua-dark">
              Générer le Reçu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};