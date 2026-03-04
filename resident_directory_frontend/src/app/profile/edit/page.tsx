'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';

// PUBLIC_INTERFACE
/**
 * Profile edit page for users to update their information
 */
export default function EditProfilePage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    unit_number: '',
    floor: '',
    phone: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        unit_number: user.unit_number || '',
        floor: user.floor || '',
        phone: user.phone || '',
        bio: '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await apiClient.updateResident(user!.id, formData);
      await refreshUser();
      setSuccess(true);
      setTimeout(() => router.push('/profile'), 2000);
    } catch (err: unknown) {
      setError((err as { message: string }).message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!user) return null;

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

          <Card>
            <h1 className="text-3xl font-bold uppercase mb-6">Edit Profile</h1>

            {error && (
              <div className="mb-4 p-3 bg-[var(--color-error)] text-white border-2 border-[var(--color-error)] font-bold">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-[var(--color-success)] text-white border-2 border-[var(--color-success)] font-bold">
                Profile updated successfully! Redirecting...
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  label="Full Name"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  required
                />

                <Input
                  type="text"
                  label="Unit Number"
                  value={formData.unit_number}
                  onChange={(e) => handleChange('unit_number', e.target.value)}
                />

                <Input
                  type="text"
                  label="Floor"
                  value={formData.floor}
                  onChange={(e) => handleChange('floor', e.target.value)}
                />

                <Input
                  type="tel"
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>

              <div className="mt-4">
                <label className="block mb-2 font-bold text-sm uppercase text-[var(--color-text)]">
                  Bio (Optional)
                </label>
                <textarea
                  className="retro-input min-h-32"
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4 mt-6">
                <Button type="submit" disabled={loading}>
                  {loading ? 'SAVING...' : 'SAVE CHANGES'}
                </Button>
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
