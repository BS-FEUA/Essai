'use client';

import { useRouter } from 'next/navigation';
import { IdCard, ShieldCheck } from 'lucide-react';
import { MemberBadgeSection } from '@/components/views/MemberBadgeSection';

export default function BadgesPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-2xl border border-emerald-700/15 bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#0d4271] p-5 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-100">
            <ShieldCheck className="h-4 w-4" /> Espace indépendant
          </p>
          <h1 className="flex items-center gap-3 text-2xl font-black sm:text-3xl"><IdCard className="h-7 w-7 text-emerald-300" />Badges FEUA</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75">Gérez votre carte officielle et, selon votre niveau d’accès, les demandes de validation du bureau.</p>
        </div>
      </header>

      <MemberBadgeSection onAddPhoto={() => router.push('/dashboard?editProfile=1')} />
    </div>
  );
}
