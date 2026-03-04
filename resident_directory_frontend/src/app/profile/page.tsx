'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import Button from '@/components/Button';

// PUBLIC_INTERFACE
/**
 * User profile view page
 */
export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--color-background)]">
        <Navbar />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold uppercase mb-2">{user.full_name}</h1>
                <p className="text-[var(--color-text-secondary)] font-bold">{user.email}</p>
              </div>
              {user.role === 'admin' && (
                <span className="retro-badge text-[var(--color-accent)]">ADMIN</span>
              )}
            </div>

            <Button onClick={() => router.push('/profile/edit')} className="mb-6">
              Edit Profile
            </Button>

            <div className="retro-divider" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {user.unit_number && (
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                    Unit Number
                  </h3>
                  <p className="text-lg font-bold">📍 {user.unit_number}</p>
                </div>
              )}

              {user.floor && (
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                    Floor
                  </h3>
                  <p className="text-lg font-bold">🏢 {user.floor}</p>
                </div>
              )}

              {user.phone && (
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                    Phone
                  </h3>
                  <p className="text-lg font-bold">📞 {user.phone}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                  Role
                </h3>
                <p className="text-lg font-bold uppercase">{user.role}</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                  Account Status
                </h3>
                <p className="text-lg font-bold uppercase">
                  {user.is_active ? '✅ Active' : '❌ Inactive'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                  Member Since
                </h3>
                <p className="text-lg font-bold">
                  📅 {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
