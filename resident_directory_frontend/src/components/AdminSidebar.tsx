'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from './Button';

// PUBLIC_INTERFACE
/**
 * Sidebar navigation for admin users
 */
export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin/residents', label: 'Residents', icon: '👥' },
    { href: '/admin/invitations', label: 'Invitations', icon: '✉️' },
    { href: '/admin/announcements', label: 'Announcements', icon: '📢' },
    { href: '/admin/messages', label: 'Messages', icon: '💬' },
    { href: '/admin/audit-logs', label: 'Audit Logs', icon: '📋' },
  ];

  return (
    <div className="admin-sidebar w-64 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold uppercase mb-2">🏢 Admin Panel</h1>
        <p className="text-sm opacity-90">{user?.full_name}</p>
        <p className="text-xs opacity-75">{user?.email}</p>
      </div>

      <nav className="space-y-2 mb-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 rounded font-bold uppercase text-sm transition-all ${
                isActive
                  ? 'bg-white text-[var(--color-primary)] shadow-lg'
                  : 'hover:bg-white/20'
              }`}
            >
              {item.icon} {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full bg-white/10 border-white text-white hover:bg-white hover:text-[var(--color-primary)]"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
