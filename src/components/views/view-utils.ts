// ─── Relative time helper ─────────────────────────
export function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin}min`;
  if (diffH < 24) return `Il y a ${diffH}h`;
  if (diffD < 7) return `Il y a ${diffD}j`;
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

// ─── Status/role helpers ─────────────────────────────
export const statusBadge: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  ACTIVE: { label: 'Actif', variant: 'default' },
  PENDING_VALIDATION: { label: 'En attente', variant: 'secondary' },
  ARCHIVED: { label: 'Archivé', variant: 'outline' },
  IGNORANT: { label: 'Ignorant', variant: 'destructive' },
};

export const orderBadge: Record<string, { label: string; color: string }> = {
  EN_ATTENTE: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  VAL1: { label: 'Validé 1', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  VAL2: { label: 'Validé 2', color: 'bg-[var(--feua-green-light)] text-[var(--feua-green)] dark:bg-emerald-900/30 dark:text-emerald-300' },
  LIVRE: { label: 'Livré', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  ANNULE: { label: 'Annulé', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

export const roleBadgeColor: Record<string, string> = {
  CEO: 'bg-[var(--feua-gold)] text-white',
  MAST_IN: 'bg-[var(--feua-gold)] text-[var(--feua-dark)]',
  MAST: 'bg-[var(--feua-green)] text-white',
  MASTER: 'bg-[var(--feua-green)] text-white',
  MIX: 'bg-emerald-600 text-white',
  MIN: 'bg-emerald-400 text-[var(--feua-dark)]',
  AMC: 'bg-gray-400 text-white',
  IGN: 'bg-gray-300 text-gray-700',
};

export const statusBadgeSoft: Record<string, string> = {
  ACTIVE: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PENDING_VALIDATION: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  ARCHIVED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  IGNORANT: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const docTypeColors: Record<string, string> = {
  FICHE_PRE_INSCRIPTION: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  CARTE_ETUDIANT: 'bg-[var(--feua-gold-light)] text-[var(--feua-gold)] dark:bg-amber-900/30 dark:text-amber-400',
  BULLETIN: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CERTIFICAT: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  AUTRE: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};
