'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { HomeLanding } from '@/components/views/HomeLanding';

export default function HomePage() {
  const { checkSession } = useAppStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return <HomeLanding />;
}
