"use client";

import React, { useState } from "react";
import {
  FolderDown,
  FileText,
  Download,
  Search,
  CheckCircle2,
  BookOpen,
  Sparkles,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import { DocumentItem } from "@/types";
import { formatDate } from "@/lib/utils";

interface LibrarySectionProps {
  documents: DocumentItem[];
  searchQuery: string;
  canUpload?: boolean;
  onAddDocument?: (document: { file: File; title: string; category: DocumentItem["category"]; description: string }) => void;
}

export const LibrarySection: React.FC<LibrarySectionProps> = ({
  documents,
  searchQuery,
  canUpload = false,
  onAddDocument,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [downloadCounts, setDownloadCounts] = useState<Record<string, number>>({});
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DocumentItem["category"]>("Rapports d'Activités");
  const [description, setDescription] = useState("");
  const [uploadError, setUploadError] = useState("");

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

    // Create a mock download blob trigger
    const content = `UNION ÉTUDIANTE FEUA - BS-LOKOSSA\nDocument Officiel: ${doc.title}\nCatégorie: ${doc.category}\nDate de mise en ligne: ${doc.dateUploaded}\n\nDescription:\n${doc.description}\n\nCe document fait foi de texte officiel conservé aux archives du Bureau Syndical de Lokossa.`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${doc.title.replace(/\s+/g, "_")}_BS-Lokossa.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !title.trim() || !description.trim()) return setUploadError("Tous les champs sont obligatoires.");
    const allowed = ["application/pdf", "image/png", "image/jpeg", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"];
    if (!allowed.includes(file.type)) return setUploadError("Format refusé. Autorisés : PDF, DOC/DOCX, PNG et JPG.");
    if (file.size > 10 * 1024 * 1024) return setUploadError("Document trop volumineux : maximum 10 Mo.");
    onAddDocument?.({ file, title: title.trim(), category, description: description.trim() });
    setFile(null); setTitle(""); setDescription(""); setUploadError(""); setShowUpload(false);
  };

  return (
    <section className="space-y-6">
      {/* Header */}
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

        {canUpload && <button onClick={() => setShowUpload(true)} className="rounded-xl bg-feua px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-feua-dark">Ajouter un document</button>}

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

      {showUpload && (
        <form onSubmit={handleUpload} className="glass rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between"><h3 className="font-bold text-slate-900">Ajouter un document officiel</h3><button type="button" onClick={() => setShowUpload(false)} className="text-xs font-bold text-slate-500">Annuler</button></div>
          <p className="text-xs text-slate-600">PDF, DOC/DOCX, PNG ou JPG uniquement — taille maximale : 10 Mo. Tout ajout est journalisé dans la version connectée.</p>
          <div className="grid gap-3 sm:grid-cols-2"><input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre du document" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" /><select value={category} onChange={(e) => setCategory(e.target.value as DocumentItem["category"])} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></div>
          <textarea required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description et usage du document" className="min-h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
          <input required type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setUploadError(""); }} className="block w-full text-xs" />
          {uploadError && <p className="text-xs font-semibold text-rose-600">{uploadError}</p>}
          <button className="rounded-xl bg-feua px-4 py-2 text-xs font-bold text-white hover:bg-feua-dark">Enregistrer le document</button>
        </form>
      )}

      {/* Document Grid */}
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
