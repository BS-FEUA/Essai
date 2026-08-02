"use client";

import React, { useState } from "react";
import {
  Megaphone,
  Pin,
  Calendar,
  PlusCircle,
  ChevronRight,
} from "lucide-react";
import { Communique } from "@/types";
import { formatDate } from "@/lib/utils";

interface CommuniquesSectionProps {
  communiques: Communique[];
  isAdminMode: boolean;
  searchQuery: string;
  onOpenNewCommunique: () => void;
  onViewCommunique: (item: Communique) => void;
}

export const CommuniquesSection: React.FC<CommuniquesSectionProps> = ({
  communiques,
  isAdminMode,
  searchQuery,
  onOpenNewCommunique,
  onViewCommunique,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");

  const categories = ["Tous", "Urgent", "Académique", "Assemblé Générale", "Social", "Information"];

  const filteredCommuniques = communiques.filter((item) => {
    const matchesCategory =
      selectedCategory === "Tous" || item.category === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesQuery;
  });

  const pinnedCommuniques = filteredCommuniques.filter((c) => c.isPinned);
  const regularCommuniques = filteredCommuniques.filter((c) => !c.isPinned);

  return (
    <section className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl ring-1 ring-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-feua" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Communiqués Officiels du BS-Lokossa
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Les déclarations, informations et décisions prises par le Bureau Syndical pour les étudiants de Lokossa.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdminMode && (
            <button
              onClick={onOpenNewCommunique}
              className="bg-feua hover:bg-feua-dark text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>Rédiger un communiqué</span>
            </button>
          )}
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? "bg-slate-900 text-amber-300 shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 ring-1 ring-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Pinned Section if any */}
      {pinnedCommuniques.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
            <Pin className="w-4 h-4 fill-amber-500" />
            <span>Communiqués Épinglés à l&apos;Affiche</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pinnedCommuniques.map((item) => (
              <div
                key={item.id}
                onClick={() => onViewCommunique(item)}
                className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white rounded-2xl p-5 shadow-md border border-emerald-500/40 relative cursor-pointer hover:border-amber-400/80 transition-all group"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                    {item.referenceNumber}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                    {item.category}
                  </span>
                </div>

                <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-3 mt-2 leading-relaxed">
                  {item.summary}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{formatDate(item.date)}</span>
                  </div>
                  <span className="text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Lire la suite <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Communiques List */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Tous les communiqués ({filteredCommuniques.length})
        </div>

        {filteredCommuniques.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center ring-1 ring-slate-200">
            <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              Aucun communiqué trouvé pour ce filtre.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Essayez de modifier votre mot-clé de recherche ou sélectionnez &quot;Tous&quot;.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularCommuniques.map((item) => (
              <div
                key={item.id}
                onClick={() => onViewCommunique(item)}
                className="bg-white rounded-2xl p-5 ring-1 ring-slate-200/90 shadow-sm hover:shadow-md hover:ring-feua/50 transition cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {item.referenceNumber}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-feua transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(item.date)}</span>
                  </div>

                  <div className="flex items-center gap-1 text-feua font-semibold">
                    <span>Consulter</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
