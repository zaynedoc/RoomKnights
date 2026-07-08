"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';

export default function Home() {
  const router = useRouter();
  const { activeUserId, mounted } = useApp();

  useEffect(() => {
    if (mounted) {
      if (activeUserId) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [activeUserId, mounted, router]);

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-amber-400 font-mono">
      <span>REDIRECTING TO PORTAL...</span>
    </div>
  );
}
