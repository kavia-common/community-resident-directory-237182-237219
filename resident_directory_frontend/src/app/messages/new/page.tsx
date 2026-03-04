'use client';

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient, Resident } from '@/lib/api-client';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';

function NewMessageForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipientId = searchParams.get('recipient');

  const [residents, setResidents] = useState<Resident[]>([]);
  const [formData, setFormData] = useState({
    recipient_id: recipientId || '',
    subject: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const data = await apiClient.getResidents();
      setResidents(data);
    } catch (err: unknown) {
      console.error('Failed to load residents:', err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await apiClient.sendMessage({
        recipient_id: formData.recipient_id || undefined,
        subject: formData.subject,
        content: formData.content,
      });
      setSuccess(true);
      setTimeout(() => router.push('/messages'), 2000);
    } catch (err: unknown) {
      setError((err as { message: string }).message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            ← Back
          </Button>
        </div>

        <Card>
          <h1 className="text-3xl font-bold uppercase mb-6">✉️ New Message</h1>

          {error && (
            <div className="mb-4 p-3 bg-[var(--color-error)] text-white border-2 border-[var(--color-error)] font-bold">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-[var(--color-success)] text-white border-2 border-[var(--color-success)] font-bold">
              Message sent successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2 font-bold text-sm uppercase text-[var(--color-text)]">
                Recipient
              </label>
              <select
                className="retro-input"
                value={formData.recipient_id}
                onChange={(e) => handleChange('recipient_id', e.target.value)}
              >
                <option value="">Select a resident...</option>
                {residents.map((resident) => (
                  <option key={resident.id} value={resident.id}>
                    {resident.full_name} ({resident.email})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)] font-bold">
                Leave empty to broadcast to all residents
              </p>
            </div>

            <Input
              type="text"
              label="Subject"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              placeholder="Message subject..."
              required
            />

            <div className="mb-4">
              <label className="block mb-2 font-bold text-sm uppercase text-[var(--color-text)]">
                Message
              </label>
              <textarea
                className="retro-input min-h-48"
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                placeholder="Write your message here..."
                rows={6}
                required
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'SENDING...' : 'SEND MESSAGE'}
              </Button>
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}

// PUBLIC_INTERFACE
/**
 * New message compose page
 */
export default function NewMessagePage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
          <div className="retro-card">
            <p className="text-lg font-bold">LOADING...</p>
          </div>
        </div>
      }>
        <NewMessageForm />
      </Suspense>
    </ProtectedRoute>
  );
}
