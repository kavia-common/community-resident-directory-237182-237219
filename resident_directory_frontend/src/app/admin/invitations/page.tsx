'use client';

import { useState, useEffect, FormEvent } from 'react';
import { apiClient, Invitation } from '@/lib/api-client';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSidebar from '@/components/AdminSidebar';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';

// PUBLIC_INTERFACE
/**
 * Admin page for managing resident invitations
 */
export default function AdminInvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    role: 'resident' as 'admin' | 'resident',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getInvitations();
      setInvitations(data);
    } catch (err: unknown) {
      setError((err as { message: string }).message || 'Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvitation = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const newInvitation = await apiClient.createInvitation(formData);
      setInvitations((prev) => [newInvitation, ...prev]);
      setFormData({ email: '', role: 'resident' });
    } catch (err: unknown) {
      alert((err as { message: string }).message || 'Failed to create invitation');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteInvitation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invitation?')) {
      return;
    }

    try {
      await apiClient.deleteInvitation(id);
      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
    } catch (err: unknown) {
      alert((err as { message: string }).message || 'Failed to delete invitation');
    }
  };

  const copyInvitationLink = (token: string) => {
    const link = `${window.location.origin}/register?token=${token}`;
    navigator.clipboard.writeText(link);
    alert('Invitation link copied to clipboard!');
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="flex min-h-screen bg-[var(--color-background)]">
        <AdminSidebar />
        
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold uppercase mb-2">Invitation Management</h1>
            <p className="text-[var(--color-text-secondary)] font-bold">
              Invite new residents and admins to join
            </p>
          </div>

          {/* Create Invitation Form */}
          <Card className="mb-8">
            <h2 className="text-xl font-bold uppercase mb-4">✉️ Create New Invitation</h2>
            <form onSubmit={handleCreateInvitation}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <Input
                  type="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="user@example.com"
                  required
                />

                <div>
                  <label className="block mb-2 font-bold text-sm uppercase text-[var(--color-text)]">
                    Role
                  </label>
                  <select
                    className="retro-input"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, role: e.target.value as 'admin' | 'resident' }))
                    }
                  >
                    <option value="resident">Resident</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <Button type="submit" disabled={creating}>
                  {creating ? 'CREATING...' : 'CREATE INVITATION'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Invitations List */}
          {loading ? (
            <Card>
              <p className="text-center font-bold">LOADING...</p>
            </Card>
          ) : error ? (
            <Card>
              <p className="text-center font-bold text-[var(--color-error)]">{error}</p>
            </Card>
          ) : invitations.length === 0 ? (
            <Card>
              <p className="text-center font-bold text-[var(--color-text-secondary)]">
                No invitations yet
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <Card key={invitation.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold">{invitation.email}</h3>
                        <span className="retro-badge text-[var(--color-accent)] text-xs">
                          {invitation.role.toUpperCase()}
                        </span>
                        {invitation.used && (
                          <span className="retro-badge text-[var(--color-success)] text-xs">
                            USED
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-[var(--color-text-secondary)] mb-2 font-bold">
                        Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                      </p>

                      {!invitation.used && (
                        <p className="text-xs text-[var(--color-text-secondary)] font-mono break-all">
                          Token: {invitation.token}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {!invitation.used && (
                        <Button
                          variant="secondary"
                          onClick={() => copyInvitationLink(invitation.token)}
                          className="text-xs py-2 px-3"
                        >
                          Copy Link
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteInvitation(invitation.id)}
                        className="text-xs py-2 px-3"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
