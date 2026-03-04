'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// PUBLIC_INTERFACE
/**
 * Home page that redirects users based on authentication status
 */
export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <main className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
      <div className="retro-card">
        <h1 className="text-2xl font-bold uppercase">Loading...</h1>
      </div>
    </main>
  );
}
