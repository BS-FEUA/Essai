'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { apiFetch, ACCESS_LABELS } from '@/lib/store';
import { isLeadershipBadgeLevel } from '@/lib/badge-rules';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { CheckCircle2, ChevronLeft, ChevronRight, Clock3, Download, IdCard, Loader2, RefreshCw, Search, ShieldCheck, XCircle } from 'lucide-react';

type MemberBadge = {
  matricule: string;
  firstName: string;
  lastName: string;
  accessLevel: string;
  status: string;
  institution: string | null;
  filiere: string | null;
  niveau: string | null;
  photoUrl: string | null;
  badgeStatus: 'NOT_REQUESTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  verificationUrl: string | null;
};

type PendingBadge = Omit<MemberBadge, 'status' | 'badgeStatus' | 'rejectionReason' | 'verificationUrl'> & {
  id: string;
  requiresCeo: boolean;
  canReview: boolean;
};

type BadgeResponse = {
  badge: MemberBadge;
  pendingBadges: PendingBadge[];
  canReview: boolean;
  pendingTotal: number;
  pendingPage: number;
  pendingPages: number;
};

function loadImage(src: string, crossOrigin = false) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    if (crossOrigin) image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Image indisponible'));
    image.src = src;
  });
}

function currentAcademicYear() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Porto-Novo', year: 'numeric', month: 'numeric',
  }).formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const endYear = month >= 9 ? year + 1 : year;
  return `${endYear - 1}-${endYear}`;
}

async function downloadBadgePng(badge: MemberBadge) {
  const qrCanvas = document.querySelector<HTMLCanvasElement>('#feua-member-badge-qr canvas');
  if (!qrCanvas) throw new Error('Le QR code du badge est indisponible.');

  const canvas = document.createElement('canvas');
  canvas.width = 750;
  canvas.height = 1050;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Impossible de générer l’image du badge.');

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#0d4271';
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(750, 0);
  context.lineTo(750, 310);
  context.quadraticCurveTo(680, 420, 480, 420);
  context.lineTo(0, 420);
  context.closePath();
  context.fill();

  context.fillStyle = '#ffffff';
  context.fillRect(535, 0, 155, 195);
  context.beginPath();
  context.arc(612.5, 195, 77.5, 0, Math.PI);
  context.fill();

  try {
    const logo = await loadImage('/feua-logo-transparent.png');
    context.drawImage(logo, 542, 48, 140, 140);
  } catch {
    // Keep the badge readable if the logo asset cannot be loaded.
  }

  context.fillStyle = '#ffffff';
  context.font = '900 88px Arial';
  context.fillText('FEUA', 55, 175);
  context.fillStyle = '#22a06b';
  context.font = '700 27px Arial';
  context.fillText('BUREAU SECTORIEL', 58, 215);
  context.fillText('DE LOKOSSA', 58, 248);

  context.strokeStyle = '#0d4271';
  context.lineWidth = 2.5;
  for (let index = 0; index < 4; index += 1) {
    context.beginPath();
    context.moveTo(0, 480 + index * 22);
    context.lineTo(95 - index * 15, 420);
    context.stroke();
    context.beginPath();
    context.moveTo(750, 410 + index * 22);
    context.lineTo(620 + index * 15, 515);
    context.stroke();
  }

  const photoX = 245;
  const photoY = 275;
  const photoSize = 260;
  context.fillStyle = '#147a4b';
  context.fillRect(photoX - 4, photoY - 4, photoSize + 8, photoSize + 8);
  try {
    const photo = badge.photoUrl ? await loadImage('/api/badges/photo') : null;
    if (photo) {
      const scale = Math.max(photoSize / photo.width, photoSize / photo.height);
      const sourceWidth = photoSize / scale;
      const sourceHeight = photoSize / scale;
      context.drawImage(photo, (photo.width - sourceWidth) / 2, (photo.height - sourceHeight) / 2, sourceWidth, sourceHeight, photoX, photoY, photoSize, photoSize);
    } else {
      throw new Error('Photo manquante');
    }
  } catch {
    context.fillStyle = '#e8f4ed';
    context.fillRect(photoX, photoY, photoSize, photoSize);
    context.fillStyle = '#147a4b';
    context.font = '700 78px Arial';
    context.textAlign = 'center';
    context.fillText(`${badge.firstName[0] || ''}${badge.lastName[0] || ''}`.toUpperCase(), 375, 425);
    context.textAlign = 'left';
  }

  const isLeader = isLeadershipBadgeLevel(badge.accessLevel);
  context.textAlign = 'center';
  context.fillStyle = '#111111';
  context.font = `${`${badge.firstName} ${badge.lastName}`.length > 26 ? 'bold 30px' : 'bold 42px'} Arial`;
  context.fillText(`${badge.firstName} ${badge.lastName.toUpperCase()}`.slice(0, 32), 375, 600);
  context.fillStyle = '#222222';
  context.font = '600 26px Arial';
  context.fillText(isLeader ? (ACCESS_LABELS[badge.accessLevel] || badge.accessLevel) : 'Membre actif', 375, 642);

  context.fillStyle = '#147a4b';
  context.fillRect(0, 670, 750, 62);
  context.fillStyle = '#ffffff';
  context.font = 'bold 30px Arial';
  context.fillText(isLeader ? 'DIRIGEANT' : 'ENGAGEMENT ÉTUDIANT', 375, 712);

  context.fillStyle = '#0d4271';
  context.fillRect(0, 732, 750, 72);
  context.fillStyle = '#ffffff';
  context.font = 'bold 36px Arial';
  context.fillText(`${isLeader ? 'MANDAT' : 'PROMOTION'} ${currentAcademicYear()}`, 375, 780);

  context.fillStyle = '#147a4b';
  context.fillRect(0, 804, 750, 246);
  context.textAlign = 'left';
  context.fillStyle = '#ffffff';
  context.font = 'bold 27px Arial';
  context.fillText('Fédération des Étudiants', 35, 878);
  context.fillText('de l’Université d’Abomey', 35, 918);
  context.font = '600 18px Arial';
  context.fillText(badge.matricule.slice(0, 24), 35, 968);

  context.fillStyle = '#ffffff';
  context.fillRect(465, 828, 185, 185);
  context.drawImage(qrCanvas, 475, 838, 165, 165);
  context.save();
  context.translate(685, 920);
  context.rotate(-Math.PI / 2);
  context.textAlign = 'center';
  context.fillStyle = '#ffffff';
  context.font = '15px Arial';
  context.fillText('Scanner pour vérifier', 0, 0);
  context.fillText('l’identité', 0, 18);
  context.restore();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Export PNG impossible.')), 'image/png');
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Badge_FEUA_${badge.matricule.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
  link.click();
  URL.revokeObjectURL(url);
}

export function MemberBadgeSection({ onAddPhoto }: { onAddPhoto: () => void }) {
  const [data, setData] = useState<BadgeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [queueSearch, setQueueSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [queuePage, setQueuePage] = useState(1);

  const reload = useCallback(async () => {
    try {
      const parameters = new URLSearchParams({ page: String(queuePage), limit: '8' });
      if (appliedSearch) parameters.set('search', appliedSearch);
      const response = await apiFetch<BadgeResponse>(`/api/badges?${parameters}`);
      const lastPage = Math.max(1, response.pendingPages);
      if (queuePage > lastPage) {
        setQueuePage(lastPage);
        return;
      }
      setData(response);
      setError('');
    } catch {
      setError('Impossible de charger les informations du badge.');
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, queuePage]);

  useEffect(() => {
    void reload();
    window.addEventListener('feua:member-profile-updated', reload);
    return () => window.removeEventListener('feua:member-profile-updated', reload);
  }, [reload]);

  const requestBadge = async () => {
    setSubmitting(true);
    setError('');
    try {
      await apiFetch('/api/badges', { method: 'POST', body: JSON.stringify({ action: 'request' }) });
      await reload();
    } catch {
      setError('La demande n’a pas pu être envoyée. Vérifiez votre photo puis réessayez.');
    } finally { setSubmitting(false); }
  };

  const handleQueueSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQueuePage(1);
    setAppliedSearch(queueSearch.trim());
  };

  const reviewBadge = async (memberId: string, decision: 'APPROVED' | 'REJECTED') => {
    const reason = decision === 'REJECTED' ? window.prompt('Motif du refus (obligatoire) :')?.trim() : undefined;
    if (decision === 'REJECTED' && !reason) return;
    setSubmitting(true);
    try {
      await apiFetch('/api/badges', {
        method: 'POST',
        body: JSON.stringify({ action: 'review', memberId, decision, reason }),
      });
      await reload();
    } catch {
      setError('La décision n’a pas pu être enregistrée. Actualisez la page et réessayez.');
    } finally { setSubmitting(false); }
  };

  const download = async () => {
    if (!data?.badge) return;
    setDownloading(true);
    setError('');
    try { await downloadBadgePng(data.badge); }
    catch (downloadError) { setError(downloadError instanceof Error ? downloadError.message : 'Le téléchargement a échoué.'); }
    finally { setDownloading(false); }
  };

  if (loading) return <Card><CardContent className="p-6 text-sm text-muted-foreground">Chargement du badge…</CardContent></Card>;
  if (!data) return <Card><CardContent className="p-6 text-sm text-destructive">{error || 'Badge indisponible.'}</CardContent></Card>;

  const badge = data.badge;
  const statusLabel = {
    NOT_REQUESTED: 'Non demandé', PENDING: 'En attente de validation', APPROVED: 'Autorisé', REJECTED: 'À corriger',
  }[badge.badgeStatus];

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-[var(--feua-green)]/25">
        <CardHeader className="flex flex-row items-start justify-between gap-4 bg-gradient-to-r from-[var(--feua-green)] to-emerald-700 text-white">
          <div>
            <CardTitle className="flex items-center gap-2"><IdCard className="h-5 w-5" />Mon badge FEUA</CardTitle>
            <CardDescription className="mt-1 text-white/75">Carte officielle avec QR code de vérification.</CardDescription>
          </div>
          <Badge className="border border-white/25 bg-white/15 text-white">{statusLabel}</Badge>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-200">{error}</p>}

          {badge.badgeStatus === 'APPROVED' && badge.verificationUrl ? (
            <div className="space-y-4">
              <div className="mx-auto w-full max-w-sm overflow-hidden border-2 border-[var(--feua-green)] bg-white text-slate-900 shadow-lg">
                <div className="relative h-44 bg-[#0d4271] px-5 pt-8 text-white">
                  <div className="absolute -right-2 -top-8 flex h-36 w-28 items-end justify-center rounded-b-full bg-white pb-2">
                    <img src="/feua-logo-transparent.png" alt="" className="h-24 w-24 object-contain" />
                  </div>
                  <p className="text-5xl font-black">FEUA</p>
                  <p className="mt-1 text-xs font-bold tracking-wide text-emerald-300">BUREAU SECTORIEL</p>
                  <p className="text-xs font-bold tracking-wide text-emerald-300">DE LOKOSSA</p>
                </div>
                <div className="relative px-5 pb-4 text-center">
                  <Avatar className="mx-auto -mt-14 h-28 w-28 rounded-2xl border-4 border-[var(--feua-green)] bg-white shadow-md">
                    <AvatarImage src={badge.photoUrl || undefined} alt={`Photo de ${badge.firstName} ${badge.lastName}`} />
                    <AvatarFallback className="rounded-xl bg-emerald-50 text-2xl font-bold text-emerald-800">{badge.firstName[0]}{badge.lastName[0]}</AvatarFallback>
                  </Avatar>
                  <p className="mt-3 break-words text-lg font-extrabold">{badge.firstName} {badge.lastName.toUpperCase()}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">{isLeadershipBadgeLevel(badge.accessLevel) ? ACCESS_LABELS[badge.accessLevel] : 'Membre actif'}</p>
                  <div className="mt-4 bg-[var(--feua-green)] px-3 py-2 text-sm font-bold text-white">
                    {isLeadershipBadgeLevel(badge.accessLevel) ? 'DIRIGEANT' : 'ENGAGEMENT ÉTUDIANT'}
                  </div>
                  <div className="bg-[#0d4271] px-3 py-2 text-sm font-bold text-white">
                    {isLeadershipBadgeLevel(badge.accessLevel) ? 'MANDAT' : 'PROMOTION'} {currentAcademicYear()}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 bg-[var(--feua-green)] p-3 text-white">
                  <div className="min-w-0 text-left text-xs font-semibold leading-relaxed">
                    <p>Fédération des Étudiants</p><p>de l’Université d’Abomey</p>
                    <p className="mt-1 break-all text-[10px] font-normal">{badge.matricule}</p>
                  </div>
                  <div id="feua-member-badge-qr" className="shrink-0 bg-white p-1.5 text-center">
                    <QRCodeCanvas value={badge.verificationUrl} size={112} level="H" marginSize={4} title="QR code de vérification du badge" />
                    <p className="text-[8px] font-semibold text-slate-600">Scanner pour vérifier</p>
                  </div>
                </div>
              </div>
              <Button onClick={download} disabled={downloading} className="bg-[var(--feua-green)] text-white hover:bg-emerald-800">
                {downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Télécharger le badge en PNG
              </Button>
            </div>
          ) : badge.badgeStatus === 'PENDING' ? (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
              <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div><p className="font-semibold">Votre demande est en cours d’examen.</p><p className="mt-1 text-muted-foreground">Le badge sera généré dès qu’un responsable autorisé aura validé votre photo et votre profil.</p></div>
            </div>
          ) : (
            <div className="space-y-3">
              {badge.badgeStatus === 'REJECTED' && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-200">
                  <p className="font-semibold">La demande doit être corrigée.</p>
                  <p className="mt-1">Motif : {badge.rejectionReason || 'Aucun motif fourni.'}</p>
                </div>
              )}
              {!badge.photoUrl ? (
                <div className="rounded-xl border border-slate-200 bg-muted/40 p-4 text-sm text-muted-foreground">
                  Ajoutez une photo officielle dans « Modifier le profil » avant de demander le badge.
                  <div className="mt-3"><Button variant="outline" onClick={onAddPhoto}>Ajouter une photo</Button></div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">La demande est transmise aux responsables. Les badges des dirigeants requièrent la validation du CEO.</p>
                  <Button onClick={requestBadge} disabled={submitting} className="shrink-0 bg-[var(--feua-green)] text-white hover:bg-emerald-800">
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    {badge.badgeStatus === 'REJECTED' ? 'Renvoyer la demande' : 'Demander mon badge'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {data.canReview && (
        <Card className="overflow-hidden border-2 border-emerald-800/15 shadow-md">
          <CardHeader className="border-b bg-slate-50/80 dark:bg-slate-900/60">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg"><ShieldCheck className="h-5 w-5 text-[var(--feua-green)]" />File de validation</CardTitle>
                <CardDescription className="mt-1">{data.pendingTotal} demande{data.pendingTotal === 1 ? '' : 's'} · Le CEO valide les badges des dirigeants.</CardDescription>
              </div>
              <Badge className="w-fit bg-emerald-800 px-3 py-1 text-sm text-white">{data.pendingTotal} en attente</Badge>
            </div>
            <form onSubmit={handleQueueSearch} className="flex gap-2 pt-2">
              <Input
                aria-label="Rechercher une demande de badge"
                placeholder="Nom ou matricule…"
                value={queueSearch}
                onChange={(event) => setQueueSearch(event.target.value)}
                className="max-w-md bg-background"
              />
              <Button type="submit" variant="outline" className="shrink-0">
                <Search className="mr-2 h-4 w-4" />Rechercher
              </Button>
            </form>
          </CardHeader>
          <CardContent className="space-y-4 p-3 sm:p-5">
            <div role="list" aria-label="Demandes de badge" className="max-h-[32rem] space-y-2 overflow-y-auto overscroll-contain pr-1">
              {data.pendingBadges.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  {data.pendingTotal === 0 && !appliedSearch ? 'Aucune demande à traiter.' : 'Aucune demande ne correspond à cette recherche.'}
                </div>
              ) : data.pendingBadges.map((request) => (
                <article role="listitem" key={request.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-950 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-11 w-11 shrink-0 ring-2 ring-emerald-700/15">
                      <AvatarImage src={request.photoUrl || undefined} alt={`Photo de ${request.firstName} ${request.lastName}`} />
                      <AvatarFallback>{request.firstName[0]}{request.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{request.firstName} {request.lastName}</p>
                      <p className="truncate text-xs text-muted-foreground">{request.matricule} · {ACCESS_LABELS[request.accessLevel] || request.accessLevel}{request.institution ? ` · ${request.institution}` : ''}</p>
                      {request.requiresCeo && <p className="mt-1 text-xs font-semibold text-amber-700">Validation CEO requise</p>}
                    </div>
                  </div>
                  {request.canReview ? (
                    <div className="grid grid-cols-2 gap-2 sm:w-52">
                      <Button size="sm" disabled={submitting} onClick={() => void reviewBadge(request.id, 'APPROVED')} className="bg-[var(--feua-green)] text-white hover:bg-emerald-800">
                        <CheckCircle2 className="mr-1.5 h-4 w-4" />Autoriser
                      </Button>
                      <Button size="sm" variant="outline" disabled={submitting} onClick={() => void reviewBadge(request.id, 'REJECTED')}>
                        <XCircle className="mr-1.5 h-4 w-4" />Refuser
                      </Button>
                    </div>
                  ) : <Badge variant="outline" className="w-fit">En attente du CEO</Badge>}
                </article>
              ))}
            </div>
            {data.pendingPages > 1 && (
              <nav aria-label="Pagination des demandes" className="flex items-center justify-between border-t pt-3">
                <p className="text-xs text-muted-foreground">Page {data.pendingPage} sur {data.pendingPages}</p>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" disabled={queuePage <= 1} onClick={() => setQueuePage((page) => page - 1)}>
                    <ChevronLeft className="mr-1 h-4 w-4" />Précédent
                  </Button>
                  <Button type="button" size="sm" variant="outline" disabled={queuePage >= data.pendingPages} onClick={() => setQueuePage((page) => page + 1)}>
                    Suivant<ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </nav>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
