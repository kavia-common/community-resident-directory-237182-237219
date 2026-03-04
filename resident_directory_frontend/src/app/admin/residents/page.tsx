'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient, Resident } from '@/lib/api-client';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSidebar from '@/components/AdminSidebar';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';

// PUBLIC_INTERFACE
/**
 * Admin page for managing residents with search and role management
 */
export default function AdminResidentsPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getResidents();
      setResidents(data);
      setFilteredResidents(data);
    } catch (err: unknown) {
      setError((err as { message: string }).message || 'Failed to load residents');
    } finally {
      setLoading(false);
    }
  };

  const filterResidents = useCallback(() => {
    if (!searchTerm) {
      setFilteredResidents(residents);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = residents.filter(
      (r) =>
        r.full_name.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term) ||
        r.unit_number?.toLowerCase().includes(term)
    );
    setFilteredResidents(filtered);
  }, [residents, searchTerm]);

  useEffect(() => {
    fetchResidents();
  }, []);

  useEffect(() => {
    filterResidents();
  }, [searchTerm, residents, filterResidents]);

  const handleDeleteResident = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resident?')) {
      return;
    }

    try {
      await apiClient.deleteResident(id);
      setResidents((prev) => prev.filter((r) => r.id !== id));
    } catch (err: unknown) {
      alert((err as { message: string }).message || 'Failed to delete resident');
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="flex min-h-screen bg-[var(--color-background)]">
        <AdminSidebar />
        
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold uppercase mb-2">Resident Management</h1>
            <p className="text-[var(--color-text-secondary)] font-bold">
              Manage resident accounts and roles
            </p>
          </div>

          <Card className="mb-8">
            <Input
              type="text"
              placeholder="🔍 Search residents by name, email, or unit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <p className="mt-2 text-sm font-bold text-[var(--color-text-secondary)]">
              Showing {filteredResidents.length} of {residents.length} residents
            </p>
          </Card>

          {loading ? (
            <Card>
              <p className="text-center font-bold">LOADING...</p>
            </Card>
          ) : error ? (
            <Card>
              <p className="text-center font-bold text-[var(--color-error)]">{error}</p>
            </Card>
          ) : filteredResidents.length === 0 ? (
            <Card>
              <p className="text-center font-bold text-[var(--color-text-secondary)]">
                No residents found
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredResidents.map((resident) => (
                <Card key={resident.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold uppercase">{resident.full_name}</h3>
                        {resident.role === 'admin' && (
                          <span className="retro-badge text-[var(--color-accent)] text-xs">
                            ADMIN
                          </span>
                        )}
                        <span className={`retro-badge text-xs ${
                          resident.is_active ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
                        }`}>
                          {resident.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>

                      <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                        📧 {resident.email}
                      </p>

                      <div className="flex gap-4 text-sm">
                        {resident.unit_number && (
                          <span className="font-bold">📍 Unit: {resident.unit_number}</span>
                        )}
                        {resident.floor && (
                          <span className="font-bold">🏢 Floor: {resident.floor}</span>
                        )}
                        {resident.phone && (
                          <span className="font-bold">📞 {resident.phone}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteResident(resident.id)}
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
