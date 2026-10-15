'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, apiFetch, cachedApiFetch } from '@/lib/store';
import { docTypeColors } from './view-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  FileText, Upload, Trash2, ChevronLeft, ChevronRight, FileUp, Loader2,
} from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export function DocumentsView() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', type: 'AUTRE', anneeScolaire: '2025-2026' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cachedApiFetch<any>(`/api/documents?page=${page}&limit=12`);
      setDocuments(data.documents);
      setTotal(data.total);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [page]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDocs();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadDocs]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !uploadForm.title.trim() || !uploadForm.description.trim()) return;
    if (selectedFile.size > 10 * 1024 * 1024) { alert('Le document ne doit pas dépasser 10 Mo.'); return; }
    setUploadError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadForm.title || selectedFile.name);
      formData.append('description', uploadForm.description);
      formData.append('type', uploadForm.type);
      formData.append('anneeScolaire', uploadForm.anneeScolaire);
      const response = await fetch('/api/upload', { method: 'POST', body: formData, credentials: 'same-origin' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Impossible de téléverser le document.');
      setUploadOpen(false);
      setUploadForm({ title: '', description: '', type: 'AUTRE', anneeScolaire: '2025-2026' });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadDocs();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Impossible de téléverser le document.');
    } finally { setUploading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce document ?')) return;
    try {
      await apiFetch(`/api/documents?id=${id}`, { method: 'DELETE' });
      loadDocs();
    } catch { /* ignore */ }
  };

  const docTypeIcon: Record<string, string> = {
    CARTE_ETUDIANT: '🪪',
    FICHE_PRE_INSCRIPTION: '📝',
    BULLETIN: '📊',
    CERTIFICAT: '📜',
    AUTRE: '📄',
  };

  return (
    <motion.div {...pageVariants} className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-[var(--feua-green)]" />Mes Documents</h1>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajouter un document</DialogTitle><DialogDescription>Sélectionnez un fichier et renseignez les informations.</DialogDescription></DialogHeader>
          <form onSubmit={handleUpload}>
            <div className="space-y-4">
              {uploadError && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{uploadError}</p>}
              <div className="space-y-2">
                <Label>Fichier *</Label>
                <Input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} required />
                <p className="text-xs text-muted-foreground">PDF, DOC/DOCX, JPG, PNG ou WebP — 10 Mo maximum.</p>
              </div>
              <div className="space-y-2"><Label>Titre *</Label><Input required value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} placeholder={selectedFile?.name || 'Titre du document'} /></div>
              <div className="space-y-2"><Label>Description et usage *</Label><Textarea required value={uploadForm.description} onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })} rows={3} placeholder="Précisez la nature et l’usage du document." /></div>
              <div className="space-y-2">
                <Label>Type de document</Label>
                <Select value={uploadForm.type} onValueChange={(v) => setUploadForm({ ...uploadForm, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CARTE_ETUDIANT">Carte étudiant</SelectItem>
                    <SelectItem value="FICHE_PRE_INSCRIPTION">Fiche pré-inscription</SelectItem>
                    <SelectItem value="BULLETIN">Bulletin</SelectItem>
                    <SelectItem value="CERTIFICAT">Certificat</SelectItem>
                    <SelectItem value="AUTRE">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Année scolaire</Label><Input value={uploadForm.anneeScolaire} onChange={(e) => setUploadForm({ ...uploadForm, anneeScolaire: e.target.value })} placeholder="2025-2026" /></div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" type="button" onClick={() => setUploadOpen(false)}>Annuler</Button>
              <Button type="submit" className="bg-[var(--feua-green)] hover:bg-[var(--feua-green)]/90 text-white" disabled={uploading}>
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}<FileUp className="mr-2 h-4 w-4" />Téléverser
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-36" />)}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Upload card */}
          <Card className="border-2 border-dashed border-[var(--feua-green)] bg-[var(--feua-green-light)]/30 dark:bg-emerald-900/20 cursor-pointer hover:bg-[var(--feua-green-light)]/50 dark:hover:bg-emerald-900/30 transition-all flex items-center justify-center min-h-[140px]" onClick={() => setUploadOpen(true)}>
            <CardContent className="p-6 flex flex-col items-center gap-3">
              <div className="p-4 rounded-full bg-[var(--feua-gold)]/10"><Upload className="h-8 w-8 text-[var(--feua-gold)]" /></div>
              <span className="font-medium text-sm text-[var(--feua-gold)]">Ajouter un document</span>
            </CardContent>
          </Card>

          {documents.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground">Aucun document. Cliquez sur le bouton pour ajouter.</p>
            </div>
          )}

          {documents.map((doc) => (
            <motion.div key={doc.id} whileHover={{ scale: 1.02 }}>
              <Card className="hover:shadow-md transition-shadow border-l-4 border-l-[var(--feua-green)] group">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-[var(--feua-green-light)] dark:bg-emerald-900/30 text-lg flex-shrink-0">{docTypeIcon[doc.type] || '📄'}</div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{doc.title}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${docTypeColors[doc.type] || ''}`}>{doc.type.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(doc.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(doc.createdAt).toLocaleDateString('fr-FR')}</span>
                    {doc.fileSize && <span>{(doc.fileSize / 1024).toFixed(0)} Ko</span>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{total} document(s)</p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" disabled={page * 12 >= total} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
