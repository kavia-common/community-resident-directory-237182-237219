'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from './Button';

// PUBLIC_INTERFACE
/**
 * Top navigation bar for resident users
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b-4 border-[var(--color-primary)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-[var(--color-primary)] uppercase">
              🏢 Resident Directory
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link href="/dashboard" className="font-bold uppercase text-sm hover:text-[var(--color-primary)]">
                Directory
              </Link>
              <Link href="/announcements" className="font-bold uppercase text-sm hover:text-[var(--color-primary)]">
                Announcements
              </Link>
              <Link href="/messages" className="font-bold uppercase text-sm hover:text-[var(--color-primary)]">
                Messages
              </Link>
              <Link href="/profile" className="font-bold uppercase text-sm hover:text-[var(--color-primary)]">
                Profile
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-bold uppercase">{user?.full_name}</span>
            <Button variant="outline" onClick={handleLogout} className="text-xs py-2 px-3">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
