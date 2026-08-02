"use client";

import React, { useState } from "react";
import {
  FolderDown,
  FileText,
  Download,
  Search,
} from "lucide-react";
import { DocumentItem } from "@/types";
import { formatDate } from "@/lib/utils";

interface LibrarySectionProps {
  documents: DocumentItem[];
  searchQuery: string;
}

export const LibrarySection: React.FC<LibrarySectionProps> = ({
  documents,
  searchQuery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [downloadCounts, setDownloadCounts] = useState<Record<string, number>>({});

  const categories = [
    "Tous",
    "Statuts & Règlements",
    "Formulaires & Modèles",
    "Rapports d'Activités",
    "Chartes",
  ];

  const filteredDocs = documents.filter((doc) => {
    const matchesCat =
      selectedCategory === "Tous" || doc.category === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === "" ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesQuery;
  });

  const handleDownload = (doc: DocumentItem) => {
    setDownloadCounts((prev) => ({
      ...prev,
      [doc.id]: (prev[doc.id] || doc.downloadCount) + 1,
    }));

    const content = `UNION ÉTUDIANTE FEUA - BS-LOKOSSA\nDocument Officiel: ${doc.title}\nCatégorie: ${doc.category}\nDate de mise en ligne: ${doc.dateUploaded}\n\nDescription:\n${doc.description}\n\nCe document fait foi de texte officiel conservé aux archives du Bureau Syndical de Lokossa.`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${doc.title.replace(/\s+/g, "_")}_BS-Lokossa.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-6">
      <div className="bg-white p-5 rounded-2xl ring-1 ring-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FolderDown className="w-5 h-5 text-feua" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Bibliothèque & Textes Fondamentaux
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Téléchargez les modèles de réclamation, les statuts du syndicat, la charte de l&apos;étudiant et les comptes-rendus financiers.
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-slate-900 text-amber-300"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => {
          const currentDownloads = downloadCounts[doc.id] ?? doc.downloadCount;

          return (
            <div
              key={doc.id}
              className="bg-white p-5 rounded-2xl ring-1 ring-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {doc.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {doc.fileSize}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-feua/10 text-feua flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {doc.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  Ajouté le {formatDate(doc.dateUploaded)} • {currentDownloads} téléchargements
                </span>

                <button
                  onClick={() => handleDownload(doc)}
                  className="bg-feua hover:bg-feua-dark text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>Télécharger</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
