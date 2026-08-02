'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { LandingView } from '@/components/views/LandingView';

export default function HomePage() {
  const { checkSession } = useAppStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return <LandingView />;
}
