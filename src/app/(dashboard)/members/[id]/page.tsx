'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { MemberProfileView } from '@/components/views/MemberProfileView';

export default function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { setSelectedMemberId } = useAppStore();

  useEffect(() => {
    if (id) setSelectedMemberId(id);
  }, [id, setSelectedMemberId]);

  return <MemberProfileView />;
}
