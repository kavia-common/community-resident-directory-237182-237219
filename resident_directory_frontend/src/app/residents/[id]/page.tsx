'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient, Resident } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import Button from '@/components/Button';

// PUBLIC_INTERFACE
/**
 * Individual resident profile page
 */
export default function ResidentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResident = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getResident(params.id as string);
      setResident(data);
    } catch (err: unknown) {
      setError((err as { message: string }).message || 'Failed to load resident');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchResident();
    }
  }, [params.id, fetchResident]);

  const isOwnProfile = user?.id === resident?.id;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--color-background)]">
        <Navbar />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button variant="outline" onClick={() => router.back()}>
              ← Back
            </Button>
          </div>

          {loading ? (
            <Card>
              <p className="text-center font-bold">LOADING...</p>
            </Card>
          ) : error ? (
            <Card>
              <p className="text-center font-bold text-[var(--color-error)]">{error}</p>
            </Card>
          ) : resident ? (
            <div className="space-y-6">
              <Card>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold uppercase mb-2">{resident.full_name}</h1>
                    <p className="text-[var(--color-text-secondary)] font-bold">{resident.email}</p>
                  </div>
                  {resident.role === 'admin' && (
                    <span className="retro-badge text-[var(--color-accent)]">ADMIN</span>
                  )}
                </div>

                {isOwnProfile && (
                  <Button onClick={() => router.push('/profile/edit')} className="mb-6">
                    Edit Profile
                  </Button>
                )}

                <div className="retro-divider" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {resident.unit_number && (
                    <div>
                      <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                        Unit Number
                      </h3>
                      <p className="text-lg font-bold">📍 {resident.unit_number}</p>
                    </div>
                  )}

                  {resident.floor && (
                    <div>
                      <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                        Floor
                      </h3>
                      <p className="text-lg font-bold">🏢 {resident.floor}</p>
                    </div>
                  )}

                  {resident.phone && (
                    <div>
                      <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                        Phone
                      </h3>
                      <p className="text-lg font-bold">📞 {resident.phone}</p>
                    </div>
                  )}

                  {resident.move_in_date && (
                    <div>
                      <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                        Move-in Date
                      </h3>
                      <p className="text-lg font-bold">
                        📅 {new Date(resident.move_in_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {resident.bio && (
                  <>
                    <div className="retro-divider" />
                    <div>
                      <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase mb-2">
                        About
                      </h3>
                      <p className="text-base leading-relaxed">{resident.bio}</p>
                    </div>
                  </>
                )}
              </Card>

              <Card>
                <h3 className="text-xl font-bold uppercase mb-4">📬 Contact</h3>
                <Button
                  onClick={() => router.push(`/messages/new?recipient=${resident.id}`)}
                  className="w-full"
                >
                  Send Message
                </Button>
              </Card>
            </div>
          ) : null}
        </main>
      </div>
    </ProtectedRoute>
  );
}
