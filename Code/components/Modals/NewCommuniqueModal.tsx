"use client";

import React, { useState } from "react";
import { X, Megaphone, Sparkles } from "lucide-react";
import { Communique, UserRole } from "@/types";
import { ROLE_INFOS } from "@/lib/data";

interface NewCommuniqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (communique: Omit<Communique, "id">) => void;
}

export const NewCommuniqueModal: React.FC<NewCommuniqueModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Communique["category"]>("Académique");
  const [authorRole, setAuthorRole] = useState<UserRole>("ceo");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [tagsInput, setTagsInput] = useState("Examens, FEUA, Lokossa");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary || !content) return;

    const roleInfo = ROLE_INFOS[authorRole];
    const today = new Date().toISOString().split("T")[0];
    const refNum = `N° 0${Math.floor(Math.random() * 20 + 19)}/2026/BS-FEUA/LOK`;

    onSubmit({
      title,
      referenceNumber: refNum,
      category,
      date: today,
      authorRole,
      authorName: `${roleInfo.title} (${roleInfo.fullName})`,
      summary,
      content,
      isPinned,
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
    });

    setTitle("");
    setSummary("");
    setContent("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-feua" />
            <h2 className="text-lg font-bold text-slate-900">
              Rédiger un Communiqué Officiel (Espace Bureau)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Titre de la déclaration *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Report des évaluations du 1er semestre..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as Communique["category"])
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none"
              >
                <option value="Académique">Académique</option>
                <option value="Assemblé Générale">Assemblé Générale</option>
                <option value="Social">Social</option>
                <option value="Information">Information</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Auteur / Signataire
              </label>
              <select
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value as UserRole)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none"
              >
                {Object.entries(ROLE_INFOS).map(([code, info]) => (
                  <option key={code} value={code}>
                    {info.title} - {info.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Résumé synthétique (1-2 phrases) *
            </label>
            <input
              type="text"
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Aperçu affiché sur les cartes de présentation..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Corps intégral du communiqué *
            </label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Camarades étudiantes et étudiants de Lokossa..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 text-feua rounded focus:ring-feua"
              />
              <span>Épingler à la une du site</span>
            </label>

            <div className="w-1/2">
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Mots-clés séparés par virgules"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold bg-feua text-white hover:bg-feua-dark shadow-sm"
            >
              Publier Officiellement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
