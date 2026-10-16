"use client";

import React, { useState } from "react";
import { X, ShieldAlert } from "lucide-react";
import { Claim } from "@/types";

interface NewClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (claim: Omit<Claim, "id" | "dateSubmitted" | "status" | "updatedAt">) => void;
}

export const NewClaimModal: React.FC<NewClaimModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [filiere, setFiliere] = useState("Informatique de Gestion - IUT");
  const [category, setCategory] = useState<Claim["category"]>("Examens & Notes");
  const [urgency, setUrgency] = useState<Claim["urgency"]>("Moyenne");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentId || !title || !description) return;

    onSubmit({
      studentName,
      studentId,
      filiere,
      category,
      urgency,
      title,
      description,
    });

    setStudentName("");
    setStudentId("");
    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-feua" />
            <h2 className="text-lg font-bold text-slate-900">Soumettre une Revendication Étudiante</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nom & Prénoms complets *</label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ex: Kodjo AGBOSSA"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-feua/30"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">N° Matricule / Carte Étudiant *</label>
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Ex: 2024-LOK-0120"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-feua/30"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Filière & École / Institut *</label>
            <input
              type="text"
              required
              value={filiere}
              onChange={(e) => setFiliere(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-feua/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Domaine de la demande</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Claim["category"])}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none"
              >
                <option value="Examens & Notes">Examens & Notes</option>
                <option value="Salles & Matériel">Salles & Matériel</option>
                <option value="Restauration & Logement">Restauration & Logement</option>
                <option value="Transport">Transport</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Niveau d&apos;urgence</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as Claim["urgency"])}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none"
              >
                <option value="Faible">Faible</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Haute">Haute</option>
                <option value="Critique">Critique</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Objet de la réclamation *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Absence de note en TP d'Automatisme L2"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-feua/30"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description détaillée des faits *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Expliquez clairement le problème rencontré pour nous permettre d'intervenir auprès de la direction..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-feua/30"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100">
              Annuler
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl font-bold bg-feua text-white hover:bg-feua-dark shadow-sm">
              Envoyer au Bureau Sectoriel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
